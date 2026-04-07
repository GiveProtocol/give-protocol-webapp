/**
 * Supabase Edge Function for wallet-based authentication
 * @module wallet-auth
 * @description Verifies a wallet signature and returns a Supabase session.
 * If the wallet is already linked to a user, signs them in.
 * If not, creates a new user + identity record and signs them in.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ethers } from 'https://esm.sh/ethers@6.9.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface WalletAuthRequest {
  walletAddress: string;
  signature: string;
  message: string;
  nonce: string;
  accountType?: 'donor' | 'charity';
}

/** Type guard for incoming request body */
function validateRequest(body: unknown): body is WalletAuthRequest {
  if (typeof body !== 'object' || body === null) return false;
  const req = body as Record<string, unknown>;
  const validAccountType =
    req.accountType === undefined ||
    req.accountType === 'donor' ||
    req.accountType === 'charity';
  return (
    typeof req.walletAddress === 'string' &&
    typeof req.signature === 'string' &&
    typeof req.message === 'string' &&
    typeof req.nonce === 'string' &&
    req.walletAddress.length === 42 &&
    req.walletAddress.startsWith('0x') &&
    validAccountType
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

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
    }

    if (!validateRequest(body)) {
      return jsonResponse({
        success: false,
        error: 'Invalid request. Required: walletAddress, signature, message, nonce',
      }, 400);
    }

    // Verify signature server-side
    const recoveredAddress = ethers.verifyMessage(body.message, body.signature);
    if (recoveredAddress.toLowerCase() !== body.walletAddress.toLowerCase()) {
      return jsonResponse({ success: false, error: 'Signature verification failed' }, 401);
    }

    // Verify the message contains the expected nonce
    if (!body.message.includes(body.nonce)) {
      return jsonResponse({ success: false, error: 'Invalid nonce in message' }, 401);
    }

    // Verify message timestamp is within 5 minutes to prevent replay attacks
    const timestampMatch = body.message.match(/Timestamp: (.+)$/m);
    if (!timestampMatch) {
      return jsonResponse({ success: false, error: 'Missing timestamp in message' }, 401);
    }
    const messageTime = new Date(timestampMatch[1]).getTime();
    if (Number.isNaN(messageTime)) {
      return jsonResponse({ success: false, error: 'Invalid timestamp in message' }, 401);
    }
    const fiveMinutesMs = 5 * 60 * 1000;
    if (Date.now() - messageTime > fiveMinutesMs) {
      return jsonResponse({ success: false, error: 'Signature has expired. Please sign in again.' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse({ success: false, error: 'Server configuration error' }, 503);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const normalizedAddress = body.walletAddress.toLowerCase();

    // Check if this wallet is already linked to a user
    const { data: existingIdentity } = await supabase
      .from('user_identities')
      .select('user_id')
      .eq('wallet_address', normalizedAddress)
      .single();

    let userId: string;

    if (existingIdentity) {
      // Wallet already linked — sign in as that user
      userId = existingIdentity.user_id;
    } else {
      // No existing identity — create a new user
      const placeholderEmail = `${normalizedAddress}@wallet.giveprotocol.io`;
      const profileType = body.accountType ?? 'donor';

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: placeholderEmail,
        email_confirm: true,
        user_metadata: { type: profileType, auth_method: 'wallet' },
      });

      if (createError || !newUser.user) {
        console.error('Failed to create wallet user:', createError);
        return jsonResponse({ success: false, error: 'Failed to create user account' }, 500);
      }

      userId = newUser.user.id;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          type: profileType,
          role: profileType,
        });

      if (profileError) {
        console.error('Failed to create profile:', profileError);
      }

      // Create or update user_identities with wallet address
      const { error: identityError } = await supabase
        .from('user_identities')
        .upsert({
          user_id: userId,
          wallet_address: normalizedAddress,
          primary_auth_method: 'wallet',
          wallet_linked_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (identityError) {
        console.error('Failed to create identity:', identityError);
      }
    }

    // Generate a magic link / session for the user
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: (await supabase.auth.admin.getUserById(userId)).data.user?.email ?? '',
    });

    if (linkError || !linkData) {
      console.error('Failed to generate session link:', linkError);
      return jsonResponse({ success: false, error: 'Failed to create session' }, 500);
    }

    // Extract the token from the link and verify it to get a session
    const url = new URL(linkData.properties.action_link);
    const token = url.searchParams.get('token');
    const tokenType = url.searchParams.get('type') ?? 'magiclink';

    if (!token) {
      return jsonResponse({ success: false, error: 'Failed to generate auth token' }, 500);
    }

    // Verify the OTP to get back a session
    const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: tokenType as 'magiclink',
    });

    if (verifyError || !sessionData.session) {
      console.error('Failed to verify OTP:', verifyError);
      return jsonResponse({ success: false, error: 'Failed to establish session' }, 500);
    }

    return jsonResponse({
      success: true,
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_in: sessionData.session.expires_in,
        token_type: sessionData.session.token_type,
        user: {
          id: sessionData.session.user.id,
          email: sessionData.session.user.email,
          user_metadata: sessionData.session.user.user_metadata,
        },
      },
      isNewUser: !existingIdentity,
    }, 200);
  } catch (error) {
    console.error('Wallet auth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return jsonResponse({ success: false, error: errorMessage }, 500);
  }
});
