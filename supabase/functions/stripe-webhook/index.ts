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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !webhookSecret) {
      console.error('Stripe env vars not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase env vars not configured');
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata ?? {};

        // Resolve charity name for the donation record
        const names = await resolveNames(supabase, {
          charityId: metadata.charityId || undefined,
          causeId: metadata.causeId || undefined,
          fundId: metadata.fundId || undefined,
          amountUsd: (session.amount_total ?? 0) / 100,
          donationType: session.mode === 'subscription' ? 'subscription' : 'one-time',
        });

        // Persist to fiat_donations
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

        // Mark checkout session as validated
        await supabase
          .from('checkout_sessions')
          .update({ validated: true })
          .eq('checkout_token', session.id);

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : null;

        if (subscriptionId) {
          // Fetch the subscription to get metadata
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
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
