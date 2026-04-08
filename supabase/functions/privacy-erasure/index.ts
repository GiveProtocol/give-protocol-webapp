/**
 * Supabase Edge Function: privacy-erasure
 * @module privacy-erasure
 * @description GDPR Art. 17 right-to-erasure service.
 *
 * Routes:
 *   POST   /functions/v1/privacy-erasure         — submit erasure request (30-day cooling-off)
 *   DELETE /functions/v1/privacy-erasure/:id     — cancel a pending erasure request
 *
 * The actual data deletion is executed by a nightly cron function that checks
 * profiles.scheduled_for_deletion_at. This function only manages the request
 * lifecycle and enforces the cooling-off period.
 *
 * Erasure sequence (executed by the cron job after cooling-off, NOT here):
 *   Step 1  — Collect blockchain refs (sbt_audit_log entries)
 *   Step 2  — Anonymize volunteer_applications PII fields
 *   Step 3  — Anonymize charity_profile authorized signer fields
 *   Step 4  — Anonymize charity_nominations.nominator_email
 *   Step 5  — Set volunteer_verifications.volunteer_id = NULL
 *   Step 6  — Hard delete wallet_aliases
 *   Step 7  — Hard delete user_identities
 *   Step 8  — Hard delete user_preferences
 *   Step 9  — Hard delete profiles
 *   Step 10 — Delete auth.users via Supabase Admin API (triggers cascades)
 *   Step 11 — Write deletion_audit_log entry
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
};

const COOLING_OFF_DAYS = 30;

/** Build a JSON response with CORS headers. */
function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(
    JSON.stringify(body),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

interface ErasureRequestBody {
  confirm?: boolean;
  reason?: string;
}

/** Validate incoming request body for erasure creation. */
function validateErasureBody(body: unknown): body is ErasureRequestBody {
  if (typeof body !== 'object' || body === null) return false;
  const req = body as Record<string, unknown>;
  return req.confirm === true;
}

/** Handle POST — submit new erasure request. */
async function handleCreateErasure(
  userId: string,
  body: ErasureRequestBody,
  supabase: SupabaseClient,
): Promise<Response> {
  // Check for an existing pending erasure request
  const { data: existingRequest } = await supabase
    .from('erasure_requests')
    .select('id, status, scheduled_deletion_date')
    .eq('user_id', userId)
    .in('status', ['pending', 'processing'])
    .order('requested_at', { ascending: false })
    .limit(1)
    .single();

  if (existingRequest) {
    return jsonResponse({
      error: 'An erasure request is already pending for your account.',
      existing_request_id: existingRequest.id,
      scheduled_deletion_date: existingRequest.scheduled_deletion_date,
    }, 409);
  }

  // Calculate cooling-off end date
  const now = new Date();
  const scheduledDeletion = new Date(now);
  scheduledDeletion.setDate(scheduledDeletion.getDate() + COOLING_OFF_DAYS);

  // Insert erasure request
  const { data: request, error: insertError } = await supabase
    .from('erasure_requests')
    .insert({
      user_id: userId,
      status: 'pending',
      reason: body.reason ?? null,
      scheduled_deletion_date: scheduledDeletion.toISOString(),
    })
    .select('id, scheduled_deletion_date')
    .single();

  if (insertError || !request) {
    return jsonResponse({ error: 'Failed to create erasure request' }, 500);
  }

  // Mark profile for scheduled deletion
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ scheduled_for_deletion_at: scheduledDeletion.toISOString() })
    .eq('user_id', userId);

  if (profileError) {
    // Non-fatal: erasure_request row is the source of truth
    console.error('Failed to set scheduled_for_deletion_at on profile:', profileError.message);
  }

  return jsonResponse({
    request_id: request.id,
    status: 'pending',
    scheduled_deletion_date: request.scheduled_deletion_date,
    message: `Your account is scheduled for deletion on ${request.scheduled_deletion_date}. You may cancel this request at any time before that date.`,
    blockchain_notice: 'Your volunteer verification records on the blockchain are permanent by design and cannot be deleted. However, your personal information will be removed from our systems and the link between your identity and on-chain records will be severed.',
  }, 202);
}

/** Handle DELETE — cancel a pending erasure request. */
async function handleCancelErasure(
  userId: string,
  requestId: string,
  supabase: SupabaseClient,
): Promise<Response> {
  // Fetch the request and verify ownership + cancellable status
  const { data: request, error: fetchError } = await supabase
    .from('erasure_requests')
    .select('id, status, scheduled_deletion_date')
    .eq('id', requestId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !request) {
    return jsonResponse({ error: 'Erasure request not found' }, 404);
  }

  if (request.status !== 'pending') {
    return jsonResponse({
      error: `Cannot cancel an erasure request with status '${request.status}'.`,
      status: request.status,
    }, 409);
  }

  // Check cooling-off period has not passed
  if (new Date(request.scheduled_deletion_date) <= new Date()) {
    return jsonResponse({
      error: 'The cooling-off period has passed. This erasure request can no longer be cancelled.',
    }, 409);
  }

  // Cancel the request
  const { error: updateError } = await supabase
    .from('erasure_requests')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('user_id', userId);

  if (updateError) {
    return jsonResponse({ error: 'Failed to cancel erasure request' }, 500);
  }

  // Clear the profile flag
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ scheduled_for_deletion_at: null })
    .eq('user_id', userId);

  if (profileError) {
    console.error('Failed to clear scheduled_for_deletion_at on profile:', profileError.message);
  }

  return jsonResponse({
    request_id: requestId,
    status: 'cancelled',
    message: 'Your account deletion request has been cancelled. Your account is now active.',
  }, 200);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse({ error: 'Server configuration error' }, 503);
  }

  // Authenticate the calling user
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return jsonResponse({ error: 'Invalid or expired token' }, 401);
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const lastSegment = pathParts[pathParts.length - 1];
  const hasRequestId = lastSegment !== 'privacy-erasure' && lastSegment.length > 10;

  try {
    if (req.method === 'POST') {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
      }

      if (!validateErasureBody(body)) {
        return jsonResponse({
          error: 'Request body must include { "confirm": true } to initiate account deletion.',
        }, 400);
      }

      return await handleCreateErasure(user.id, body, supabase);
    }

    if (req.method === 'DELETE' && hasRequestId) {
      return await handleCancelErasure(user.id, lastSegment, supabase);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return jsonResponse({ error: message }, 500);
  }
});
