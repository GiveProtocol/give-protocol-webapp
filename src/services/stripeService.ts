/**
 * Stripe client service for creating checkout sessions and redirecting.
 * @module stripeService
 */

import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/lib/supabase";
import { Logger } from "@/utils/logger";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

interface StripeCheckoutParams {
  amount: number;
  currency: string;
  charityId?: string;
  causeId?: string;
  fundId?: string;
  donationType: "one-time" | "subscription";
  donorEmail?: string;
  donorName?: string;
  feeCovered?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

/**
 * Creates a Stripe Checkout session via the stripe-checkout edge function.
 * @param params - Checkout parameters
 * @returns Session ID and hosted checkout URL
 */
export async function createStripeCheckout(
  params: StripeCheckoutParams,
): Promise<StripeCheckoutResponse> {
  const { data, error } = await supabase.functions.invoke("stripe-checkout", {
    body: params,
  });

  if (error) {
    Logger.error("Stripe checkout edge function error", { error });
    throw new Error("Failed to create checkout session");
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to create checkout session");
  }

  return {
    sessionId: data.sessionId,
    url: data.url,
  };
}

/**
 * Redirects the user to Stripe's hosted checkout page.
 * Falls back to window.location if Stripe.js redirect fails.
 * @param sessionId - Stripe Checkout Session ID
 * @param url - Direct URL to the checkout page
 */
export async function redirectToStripeCheckout(
  sessionId: string,
  url: string,
): Promise<void> {
  if (STRIPE_PUBLISHABLE_KEY) {
    try {
      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          Logger.warn("Stripe.js redirect failed, using URL fallback", {
            error: error.message,
          });
          window.location.href = url;
        }
        return;
      }
    } catch (err) {
      Logger.warn("Failed to load Stripe.js, using URL fallback", {
        error: err,
      });
    }
  }

  // Fallback: direct URL redirect
  window.location.href = url;
}
