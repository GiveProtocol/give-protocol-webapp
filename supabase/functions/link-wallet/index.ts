/**
 * Supabase Edge Function for linking a wallet to an existing authenticated user
 * @module link-wallet
 * @description Verifies wallet ownership via signature and links it to the
 * calling user's user_identities record.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ethers } from 'https://esm.sh/ethers@6.9.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface LinkWalletRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

/** Type guard for incoming request body */
function validateRequest(body: unknown): body is LinkWalletRequest {
  if (typeof body !== 'object' || body === null) return false;
  const req = body as Record<string, unknown>;
  return (
    typeof req.walletAddress === 'string' &&
    typeof req.signature === 'string' &&
    typeof req.message === 'string' &&
    req.walletAddress.length === 42 &&
    req.walletAddress.startsWith('0x')
  );
}

/** Build a JSON response with CORS headers */
function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(
    JSON.stringify(body),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
    }

    // Extract the auth token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ success: false, error: 'Authorization required' }, 401);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
    }

    if (!validateRequest(body)) {
      return jsonResponse({
        success: false,
        error: 'Invalid request. Required: walletAddress, signature, message',
      }, 400);
    }

    // Verify signature server-side
    const recoveredAddress = ethers.verifyMessage(body.message, body.signature);
    if (recoveredAddress.toLowerCase() !== body.walletAddress.toLowerCase()) {
      return jsonResponse({ success: false, error: 'Signature verification failed' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return jsonResponse({ success: false, error: 'Server configuration error' }, 503);
    }

    // Create a client with the user's auth token to get their user_id
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ success: false, error: 'Invalid authentication' }, 401);
    }

    // Use service role client for database operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const normalizedAddress = body.walletAddress.toLowerCase();

    // Check if this wallet is already linked to another user
    const { data: existingLink } = await serviceClient
      .from('user_identities')
      .select('user_id')
      .eq('wallet_address', normalizedAddress)
      .single();

    if (existingLink && existingLink.user_id !== user.id) {
      return jsonResponse({
        success: false,
        error: 'This wallet is already linked to another account',
      }, 409);
    }

    // Link the wallet to the current user's identity record
    const { error: updateError } = await serviceClient
      .from('user_identities')
      .upsert({
        user_id: user.id,
        wallet_address: normalizedAddress,
        wallet_linked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (updateError) {
      console.error('Failed to link wallet:', updateError);
      return jsonResponse({ success: false, error: 'Failed to link wallet' }, 500);
    }

    return jsonResponse({
      success: true,
      walletAddress: normalizedAddress,
      linkedAt: new Date().toISOString(),
    }, 200);
  } catch (error) {
    console.error('Link wallet error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to link wallet';
    return jsonResponse({ success: false, error: errorMessage }, 500);
  }
});
