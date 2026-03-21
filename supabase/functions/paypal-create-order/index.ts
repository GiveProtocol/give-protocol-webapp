/**
 * Supabase Edge Function for creating PayPal orders
 * @module paypal-create-order
 * @description Creates a PayPal order via the Orders V2 REST API.
 * Mirrors the helcim-pay pattern for consistency.
 *
 * Flow:
 *   1. Receive POST with donation details (amount, currency, charity/cause/fund IDs)
 *   2. Obtain PayPal OAuth2 access token via client credentials
 *   3. Resolve human-readable description from charity/cause/fund names
 *   4. Create PayPal order with CAPTURE intent
 *   5. Store checkout session in database
 *   6. Return orderId and approval URL for frontend redirect
 *
 * Note: PayPal Subscriptions API support is deferred to a later phase.
 * Subscription donations are currently processed as one-time orders.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { resolveNames } from '../_shared/receipt-context.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** JSON content-type header merged with CORS */
const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

interface CreateOrderRequest {
  amount: number;
  currency: string;
  charityId?: string;
  causeId?: string;
  fundId?: string;
  donationType: 'one-time' | 'subscription';
  donorId?: string;
  donorEmail?: string;
  donorName?: string;
}

/**
 * Type guard that validates an incoming request body matches CreateOrderRequest shape
 * @param body - Parsed request body
 * @returns Whether the body contains all required fields with valid types
 */
function validateRequest(body: unknown): body is CreateOrderRequest {
  if (typeof body !== 'object' || body === null) return false;
  const req = body as Record<string, unknown>;
  return (
    typeof req.amount === 'number' &&
    req.amount > 0 &&
    typeof req.currency === 'string' &&
    req.currency.length === 3 &&
    (req.donationType === 'one-time' || req.donationType === 'subscription')
  );
}

/**
 * Resolve the PayPal API base URL from the PAYPAL_MODE environment variable
 * @returns The base URL for sandbox or live PayPal API
 */
function getPayPalBaseUrl(): string {
  const mode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
  return mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

/**
 * Obtain a PayPal OAuth2 access token using client credentials
 * @returns The access token string
 * @throws Error if token request fails
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const baseUrl = getPayPalBaseUrl();
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal OAuth2 token error:', errorText);
    throw new Error('Failed to obtain PayPal access token');
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

/**
 * Resolve the line-item description from charity/cause/fund names
 * @param body - The validated request body
 * @returns A human-readable description for the PayPal order
 */
async function resolveDescription(body: CreateOrderRequest): Promise<string> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) return 'Charitable Donation — Give Protocol';

  const supabase = createClient(supabaseUrl, supabaseKey);
  const names = await resolveNames(supabase, {
    charityId: body.charityId,
    causeId: body.causeId,
    fundId: body.fundId,
    amountUsd: body.amount,
    donationType: body.donationType,
  });

  if (!names.charityName) return 'Charitable Donation — Give Protocol';
  return names.causeName
    ? `Donation to ${names.charityName} — ${names.causeName}`
    : `Donation to ${names.charityName}`;
}

/**
 * Create a PayPal order via the Orders V2 API
 * @param accessToken - PayPal OAuth2 access token
 * @param body - The validated request body
 * @param description - Human-readable order description
 * @returns The PayPal order response object
 * @throws Error if order creation fails
 */
async function createPayPalOrder(
  accessToken: string,
  body: CreateOrderRequest,
  description: string,
): Promise<Record<string, unknown>> {
  const baseUrl = getPayPalBaseUrl();

  const customId = JSON.stringify({
    charityId: body.charityId ?? null,
    causeId: body.causeId ?? null,
    fundId: body.fundId ?? null,
    donorId: body.donorId ?? null,
  });

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: body.currency.toUpperCase(),
          value: body.amount.toFixed(2),
        },
        description,
        custom_id: customId,
      },
    ],
  };

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal create order error:', errorText);
    throw new Error('Failed to create PayPal order');
  }

  return await response.json();
}

/**
 * Extract the approval URL from PayPal HATEOAS links
 * @param links - Array of HATEOAS link objects from PayPal response
 * @returns The approval URL, or null if not found
 */
function extractApprovalUrl(links: Array<{ rel: string; href: string }>): string | null {
  const approveLink = links.find((link) => link.rel === 'approve');
  return approveLink?.href ?? null;
}

/**
 * Persist the checkout session record to Supabase
 * @param body - The validated request body
 * @param orderId - The PayPal order ID
 */
async function storeCheckoutSession(body: CreateOrderRequest, orderId: string): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { error: insertError } = await supabase
    .from('checkout_sessions')
    .insert({
      checkout_token: orderId,
      secret_token: '',
      amount: body.amount,
      currency: body.currency.toUpperCase(),
      donation_type: body.donationType,
      charity_id: body.charityId ?? null,
      cause_id: body.causeId ?? null,
      fund_id: body.fundId ?? null,
      provider: 'paypal',
      paypal_order_id: orderId,
      validated: false,
    });

  if (insertError) {
    console.error('Failed to store checkout session:', insertError);
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: jsonHeaders },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: jsonHeaders },
      );
    }

    if (!validateRequest(body)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request. Required: amount (number > 0), currency (3-letter code), donationType',
        }),
        { status: 400, headers: jsonHeaders },
      );
    }

    // Note: PayPal Subscriptions API integration is deferred to a later phase.
    // Subscription donations are currently processed as one-time orders.
    if (body.donationType === 'subscription') {
      console.log('Subscription donation received — processing as one-time order (PayPal Subscriptions API deferred)');
    }

    const accessToken = await getPayPalAccessToken();
    const description = await resolveDescription(body);
    const orderResponse = await createPayPalOrder(accessToken, body, description);

    const orderId = orderResponse.id as string;
    const links = orderResponse.links as Array<{ rel: string; href: string }>;
    const approvalUrl = extractApprovalUrl(links);

    if (!orderId || !approvalUrl) {
      console.error('PayPal order response missing id or approval link:', orderResponse);
      throw new Error('Invalid PayPal order response');
    }

    await storeCheckoutSession(body, orderId);

    return new Response(
      JSON.stringify({ success: true, orderId, approvalUrl }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (error) {
    console.error('PayPal create order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create PayPal order';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
