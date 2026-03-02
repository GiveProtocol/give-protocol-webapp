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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!validateRequest(body)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request. Required: amount (number > 0), currency (3-letter code), donationType',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Payment system offline' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Resolve charity name for the line item description
    let description = 'Charitable Donation — Give Protocol';
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const names = await resolveNames(supabase, {
        charityId: body.charityId,
        causeId: body.causeId,
        fundId: body.fundId,
        amountUsd: body.amount,
        donationType: body.donationType,
      });
      if (names.charityName) {
        description = names.causeName
          ? `Donation to ${names.charityName} — ${names.causeName}`
          : `Donation to ${names.charityName}`;
      }
    }

    const multiplier = getSmallestUnitMultiplier(body.currency);
    const amountInSmallestUnit = Math.round(body.amount * multiplier);

    const baseUrl = body.successUrl?.replace(/\/[^/]*$/, '') || 'https://app.giveprotocol.io';
    const successUrl = body.successUrl || `${baseUrl}/charity/${body.charityId ?? ''}?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = body.cancelUrl || `${baseUrl}/charity/${body.charityId ?? ''}?payment=cancelled`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: body.donationType === 'subscription' ? 'subscription' : 'payment',
      line_items: [
        {
          price_data: {
            currency: body.currency.toLowerCase(),
            product_data: {
              name: description,
            },
            unit_amount: amountInSmallestUnit,
            ...(body.donationType === 'subscription' ? { recurring: { interval: 'month' } } : {}),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
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
      sessionParams.customer_email = body.donorEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Store session in checkout_sessions table
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error: insertError } = await supabase
        .from('checkout_sessions')
        .insert({
          checkout_token: session.id,
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

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Stripe Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
