import { useState, useCallback } from "react";
import {
  createStripeCheckout,
  redirectToStripeCheckout,
} from "@/services/stripeService";
import { Logger } from "@/utils/logger";

interface StripePaymentParams {
  amount: number;
  currency: string;
  charityId?: string;
  causeId?: string;
  fundId?: string;
  donationType: "one-time" | "subscription";
  donorEmail?: string;
  donorName?: string;
  feeCovered?: boolean;
}

interface UseStripePaymentReturn {
  processStripePayment: (_params: StripePaymentParams) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for processing Stripe payments via hosted checkout.
 * @function useStripePayment
 * @description Creates a Stripe Checkout session and redirects the user
 * to the hosted payment page. The webhook handles persistence on return.
 * @returns {UseStripePaymentReturn} Stripe payment utilities and state
 */
export function useStripePayment(): UseStripePaymentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processStripePayment = useCallback(
    async (params: StripePaymentParams): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        Logger.info("Creating Stripe checkout session", {
          amount: params.amount,
          currency: params.currency,
        });

        const { sessionId, url } = await createStripeCheckout({
          ...params,
          successUrl: `${window.location.origin}/charity/${params.charityId ?? ""}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/charity/${params.charityId ?? ""}?payment=cancelled`,
        });

        Logger.info("Redirecting to Stripe checkout", { sessionId });
        await redirectToStripeCheckout(sessionId, url);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to process Stripe payment";
        setError(message);
        Logger.error("Stripe payment error", { error: err });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    processStripePayment,
    loading,
    error,
  };
}
