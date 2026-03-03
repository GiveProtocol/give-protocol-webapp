/**
 * Supabase Edge Function for creating Stripe Checkout sessions
 * @module stripe-checkout
 * @description Creates a Stripe Checkout Session for non-USD fiat donations.
 * Mirrors the helcim-pay pattern for consistency.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { resolveNames } from '../_shared/receipt-context.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CheckoutRequest {
  amount: number;
  currency: string;
  charityId?: string;
  causeId?: string;
  fundId?: string;
  donationType: 'one-time' | 'subscription';
  donorEmail?: string;
  donorName?: string;
  feeCovered?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

/** Type guard that validates an incoming request body matches CheckoutRequest shape */
function validateRequest(body: unknown): body is CheckoutRequest {
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

/** Map currency code to Stripe's smallest unit multiplier */
function getSmallestUnitMultiplier(currency: string): number {
  const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
  return zeroDecimalCurrencies.includes(currency.toLowerCase()) ? 1 : 100;
}

/** Build a JSON response with CORS headers */
function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(
    JSON.stringify(body),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

/** Resolve the line-item description from charity/cause/fund names */
async function resolveDescription(body: CheckoutRequest): Promise<string> {
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

/** Build the Stripe Checkout session params from a validated request */
function buildSessionParams(body: CheckoutRequest, description: string): Stripe.Checkout.SessionCreateParams {
  const multiplier = getSmallestUnitMultiplier(body.currency);
  const amountInSmallestUnit = Math.round(body.amount * multiplier);
  const baseUrl = body.successUrl?.replace(/\/[^/]*$/, '') || 'https://app.giveprotocol.io';

  const params: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    mode: body.donationType === 'subscription' ? 'subscription' : 'payment',
    line_items: [
      {
        price_data: {
          currency: body.currency.toLowerCase(),
          product_data: { name: description },
          unit_amount: amountInSmallestUnit,
          ...(body.donationType === 'subscription' ? { recurring: { interval: 'month' } } : {}),
        },
        quantity: 1,
      },
    ],
    success_url: body.successUrl || `${baseUrl}/charity/${body.charityId ?? ''}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: body.cancelUrl || `${baseUrl}/charity/${body.charityId ?? ''}?payment=cancelled`,
    metadata: {
      charityId: body.charityId ?? '',
      causeId: body.causeId ?? '',
      fundId: body.fundId ?? '',
      donorName: body.donorName ?? '',
      feeCovered: String(body.feeCovered ?? false),
      platform: 'give-protocol',
    },
  };

  if (body.donorEmail) {
    params.customer_email = body.donorEmail;
  }

  return params;
}

/** Persist the checkout session record to Supabase */
async function storeCheckoutSession(body: CheckoutRequest, sessionId: string): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { error: insertError } = await supabase
    .from('checkout_sessions')
    .insert({
      checkout_token: sessionId,
      secret_token: '',
      amount: body.amount,
      currency: body.currency.toUpperCase(),
      donation_type: body.donationType,
      charity_id: body.charityId ?? null,
      cause_id: body.causeId ?? null,
      fund_id: body.fundId ?? null,
      provider: 'stripe',
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
        error: 'Invalid request. Required: amount (number > 0), currency (3-letter code), donationType',
      }, 400);
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return jsonResponse({ success: false, error: 'Payment system offline' }, 503);
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    const description = await resolveDescription(body);
    const sessionParams = buildSessionParams(body, description);
    const session = await stripe.checkout.sessions.create(sessionParams);

    await storeCheckoutSession(body, session.id);

    return jsonResponse({ success: true, sessionId: session.id, url: session.url }, 200);
  } catch (error) {
    console.error('Stripe Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return jsonResponse({ success: false, error: errorMessage }, 500);
  }
});
