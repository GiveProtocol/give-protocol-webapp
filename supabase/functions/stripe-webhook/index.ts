/**
 * Supabase Edge Function for handling Stripe webhook events
 * @module stripe-webhook
 * @description Processes Stripe webhook events (checkout.session.completed, invoice.paid)
 * to persist fiat donations and trigger attestation flows.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { resolveNames } from '../_shared/receipt-context.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** Build a JSON response with CORS headers */
function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(
    JSON.stringify(body),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

/** Handle checkout.session.completed: persist the one-time or first subscription donation */
async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const metadata = session.metadata ?? {};

  const names = await resolveNames(supabase, {
    charityId: metadata.charityId || undefined,
    causeId: metadata.causeId || undefined,
    fundId: metadata.fundId || undefined,
    amountUsd: (session.amount_total ?? 0) / 100,
    donationType: session.mode === 'subscription' ? 'subscription' : 'one-time',
  });

  const { error: donationError } = await supabase
    .from('fiat_donations')
    .insert({
      charity_id: metadata.charityId || null,
      cause_id: metadata.causeId || null,
      fund_id: metadata.fundId || null,
      charity_name: names.charityName || 'Unknown Charity',
      donor_name: metadata.donorName || session.customer_details?.name || '',
      donor_email: session.customer_details?.email || '',
      amount: (session.amount_total ?? 0) / 100,
      currency: (session.currency ?? 'usd').toUpperCase(),
      donation_type: session.mode === 'subscription' ? 'subscription' : 'one-time',
      fee_covered: metadata.feeCovered === 'true',
      stripe_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      validated: true,
    });

  if (donationError) {
    console.error('Failed to persist fiat donation:', donationError);
  }

  await supabase
    .from('checkout_sessions')
    .update({ validated: true })
    .eq('checkout_token', session.id);
}

/** Handle invoice.paid: persist a recurring subscription donation */
async function handleInvoicePaid(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  invoice: Stripe.Invoice,
): Promise<void> {
  const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : null;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const metadata = subscription.metadata ?? {};

  const names = await resolveNames(supabase, {
    charityId: metadata.charityId || undefined,
    causeId: metadata.causeId || undefined,
    fundId: metadata.fundId || undefined,
    amountUsd: (invoice.amount_paid ?? 0) / 100,
    donationType: 'subscription',
  });

  const { error: donationError } = await supabase
    .from('fiat_donations')
    .insert({
      charity_id: metadata.charityId || null,
      cause_id: metadata.causeId || null,
      fund_id: metadata.fundId || null,
      charity_name: names.charityName || 'Unknown Charity',
      donor_name: metadata.donorName || '',
      donor_email: invoice.customer_email || '',
      amount: (invoice.amount_paid ?? 0) / 100,
      currency: (invoice.currency ?? 'usd').toUpperCase(),
      donation_type: 'subscription',
      fee_covered: metadata.feeCovered === 'true',
      stripe_payment_intent_id: typeof invoice.payment_intent === 'string' ? invoice.payment_intent : null,
      validated: true,
    });

  if (donationError) {
    console.error('Failed to persist recurring donation:', donationError);
  }
}

/** Verify required environment variables are set */
function getRequiredEnv(...keys: string[]): Record<string, string> | null {
  const result: Record<string, string> = {};
  for (const key of keys) {
    const value = Deno.env.get(key);
    if (!value) return null;
    result[key] = value;
  }
  return result;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const stripeEnv = getRequiredEnv('STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET');
    if (!stripeEnv) {
      console.error('Stripe env vars not configured');
      return jsonResponse({ error: 'Webhook not configured' }, 503);
    }

    const stripe = new Stripe(stripeEnv.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return jsonResponse({ error: 'Missing stripe-signature header' }, 400);
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeEnv.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return jsonResponse({ error: 'Invalid signature' }, 400);
    }

    const dbEnv = getRequiredEnv('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY');
    if (!dbEnv) {
      console.error('Supabase env vars not configured');
      return jsonResponse({ error: 'Database not configured' }, 503);
    }

    const supabase = createClient(dbEnv.SUPABASE_URL, dbEnv.SUPABASE_SERVICE_ROLE_KEY);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(supabase, stripe, event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return jsonResponse({ received: true }, 200);
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return jsonResponse({ error: 'Webhook processing failed' }, 500);
  }
});
