/**
 * Supabase Edge Function for initializing HelcimPay.js sessions
 * @module helcim-pay
 * @description Generates a secure checkoutToken for rendering HelcimPay.js hosted fields.
 * This token is required to initialize the client-side card input form.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface InitializeRequest {
  amount: number; // Amount in dollars
  currency?: string;
  customerEmail?: string;
  donationType: 'one-time' | 'subscription';
}

interface HelcimPayInitResponse {
  checkoutToken: string;
  secretToken: string;
}

/**
 * Validate the initialization request body
 * @param body - Request body to validate
 * @returns Whether the body is a valid InitializeRequest
 */
function validateRequest(body: unknown): body is InitializeRequest {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const req = body as Record<string, unknown>;

  return (
    typeof req.amount === 'number' &&
    req.amount > 0 &&
    (req.donationType === 'one-time' || req.donationType === 'subscription')
  );
}

/**
 * Initialize HelcimPay.js session
 * @param amount - Payment amount in dollars
 * @param currency - Currency code (default: USD)
 * @param paymentType - Payment type for Helcim
 * @param apiToken - Helcim API token
 * @returns Checkout token and secret token
 */
async function initializeHelcimPaySession(
  amount: number,
  currency: string,
  paymentType: string,
  apiToken: string
): Promise<HelcimPayInitResponse> {
  // Helcim's HelcimPay.js initialization endpoint
  const response = await fetch('https://api.helcim.com/v2/helcim-pay/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-token': apiToken,
      'accept': 'application/json',
    },
    body: JSON.stringify({
      paymentType,
      amount,
      currency,
      // Enable Address Verification Service
      hasAvs: true,
      // Enable CVV verification
      hasCvv: true,
      // Allow card to be stored for future use (needed for subscriptions)
      allowCardStorage: paymentType === 'verify',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    // Parse error for more specific message
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || errorJson.error || 'Failed to initialize payment form');
    } catch {
      throw new Error(`Payment system error (status ${response.status})`);
    }
  }

  const result = await response.json();

  if (!result.checkoutToken) {
    console.error('Missing checkoutToken in Helcim API response');
    throw new Error('Invalid response from payment processor');
  }

  return {
    checkoutToken: result.checkoutToken,
    secretToken: result.secretToken || '',
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request
    if (!validateRequest(body)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request. Required: amount (number > 0), donationType ("one-time" | "subscription")'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Helcim API token from environment
    const apiToken = Deno.env.get('HELCIM_API_TOKEN');

    if (!apiToken) {
      console.error('HELCIM_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Payment system offline' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine payment type based on donation type
    // 'purchase' for one-time, 'verify' for subscription (stores card)
    const paymentType = body.donationType === 'subscription' ? 'verify' : 'purchase';
    const currency = body.currency || 'USD';

    // Initialize HelcimPay.js session
    const initResult = await initializeHelcimPaySession(
      body.amount,
      currency,
      paymentType,
      apiToken
    );

    // Return the checkout token to the frontend
    return new Response(
      JSON.stringify({
        success: true,
        checkoutToken: initResult.checkoutToken,
        secretToken: initResult.secretToken,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('HelcimPay initialization error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment form';

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
