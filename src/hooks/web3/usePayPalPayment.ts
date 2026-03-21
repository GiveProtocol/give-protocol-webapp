/**
 * Hook for processing PayPal payments via popup checkout.
 * @module usePayPalPayment
 * @description Creates a PayPal order, opens the PayPal approval popup,
 * and captures the payment on approval. Replaces the Stripe redirect flow.
 */

import { useState, useCallback } from 'react';
import { createPayPalOrder, capturePayPalOrder } from '@/services/paypalService';
import { Logger } from '@/utils/logger';

interface PayPalPaymentParams {
  amount: number;
  currency: string;
  charityId?: string;
  causeId?: string;
  fundId?: string;
  donationType: 'one-time' | 'subscription';
  donorEmail?: string;
  donorName?: string;
  donorId?: string;
}

interface PayPalPaymentResult {
  transactionId: string;
  amount: number;
  currency: string;
}

interface UsePayPalPaymentReturn {
  /** Process a PayPal payment (create order → popup → capture) */
  processPayPalPayment: (_params: PayPalPaymentParams) => Promise<PayPalPaymentResult>;
  /** Whether a PayPal payment is in progress */
  loading: boolean;
  /** Error message from the last payment attempt */
  error: string | null;
}

/**
 * Opens a PayPal approval popup and polls for completion.
 * @param {string} approvalUrl - PayPal approval URL
 * @returns {Promise<void>} Resolves when donor approves, rejects on cancel/close
 */
function waitForPayPalApproval(approvalUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const width = 450;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      approvalUrl,
      'PayPal',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`,
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }

    const pollInterval = 500;
    const timer = setInterval(() => {
      try {
        // Check if popup was closed by the user
        if (popup.closed) {
          clearInterval(timer);
          reject(new Error('Payment cancelled'));
          return;
        }

        // Check if popup redirected back to our domain (PayPal approved)
        const popupUrl = popup.location.href;
        if (popupUrl.includes('payment=success') || popupUrl.includes('token=')) {
          clearInterval(timer);
          popup.close();
          resolve();
        }
      } catch {
        // Cross-origin access error — popup is still on PayPal's domain, keep polling
      }
    }, pollInterval);
  });
}

/**
 * Hook for processing PayPal payments via popup checkout.
 * @function usePayPalPayment
 * @returns {UsePayPalPaymentReturn} PayPal payment utilities and state
 */
export function usePayPalPayment(): UsePayPalPaymentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayPalPayment = useCallback(
    async (params: PayPalPaymentParams): Promise<PayPalPaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        Logger.info('Starting PayPal payment flow', {
          amount: params.amount,
          currency: params.currency,
        });

        // Step 1: Create PayPal order via backend
        const { orderId, approvalUrl } = await createPayPalOrder(params);

        // Step 2: Open PayPal popup for donor approval
        Logger.info('Opening PayPal approval popup', { orderId });
        await waitForPayPalApproval(approvalUrl);

        // Step 3: Capture payment after approval
        Logger.info('Capturing PayPal payment', { orderId });
        const capture = await capturePayPalOrder(orderId);

        if (!capture.success) {
          throw new Error('Payment capture failed');
        }

        Logger.info('PayPal payment completed', {
          transactionId: capture.transactionId,
        });

        return {
          transactionId: capture.transactionId ?? '',
          amount: capture.amount ?? params.amount,
          currency: capture.currency ?? params.currency,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to process PayPal payment';
        setError(message);
        Logger.error('PayPal payment error', { error: err });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    processPayPalPayment,
    loading,
    error,
  };
}
