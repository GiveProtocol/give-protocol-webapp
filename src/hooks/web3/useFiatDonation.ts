import { useState, useCallback, useEffect, useRef } from 'react';
import {
  processPayment,
  createSubscription,
  loadHelcimScript,
  initializeHelcimFields,
  updateHelcimAmount,
  submitHelcimFields,
  fetchHelcimCheckoutToken,
} from '@/services/helcimService';
import { Logger } from '@/utils/logger';
import type {
  FiatPaymentData,
  HelcimPaymentResult,
  DonationFrequency,
} from '@/components/web3/donation/types/donation';

/** Return type for the useFiatDonation hook */
export interface UseFiatDonationReturn {
  /** Process a one-time or recurring payment */
  processFiatPayment: (_data: Omit<FiatPaymentData, 'checkoutToken'>) => Promise<HelcimPaymentResult>;
  /** Whether a payment is being processed */
  loading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Clear the current error */
  clearError: () => void;
  /** Initialize Helcim hosted fields in a container */
  initializeFields: (_containerId: string, _initialAmount: number, _frequency: DonationFrequency) => Promise<void>;
  /** Update the amount displayed in hosted fields */
  updateAmount: (_amount: number) => void;
  /** Whether Helcim fields are ready */
  fieldsReady: boolean;
  /** Whether fields are currently initializing */
  initializing: boolean;
}

/**
 * Hook for processing fiat donations through Helcim
 * @function useFiatDonation
 * @description Manages the lifecycle of fiat payments including loading HelcimPay.js,
 * initializing hosted fields, and processing payments/subscriptions.
 * @returns {UseFiatDonationReturn} Fiat donation utilities and state
 * @example
 * ```tsx
 * const { processFiatPayment, loading, error, initializeFields, fieldsReady } = useFiatDonation();
 *
 * useEffect(() => {
 *   if (!fieldsReady) {
 *     initializeFields('card-container', 50);
 *   }
 * }, [fieldsReady, initializeFields]);
 *
 * const handleSubmit = async () => {
 *   try {
 *     const result = await processFiatPayment({
 *       name: 'John Doe',
 *       email: 'john@example.com',
 *       amount: 50,
 *       coverFees: true,
 *       charityId: 'charity-123',
 *       charityName: 'Example Charity',
 *       frequency: 'once',
 *     });
 *     console.log('Payment successful:', result.transactionId);
 *   } catch (err) {
 *     console.error('Payment failed');
 *   }
 * };
 * ```
 */
export function useFiatDonation(): UseFiatDonationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldsReady, setFieldsReady] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Track current checkout token and container to prevent double initialization
  const initStateRef = useRef<{
    containerId: string | null;
    checkoutToken: string | null;
    frequency: DonationFrequency | null;
  }>({ containerId: null, checkoutToken: null, frequency: null });

  // Load HelcimPay.js script on mount
  useEffect(() => {
    let mounted = true;

    loadHelcimScript()
      .then(() => {
        if (mounted) {
          setScriptLoaded(true);
          Logger.info('HelcimPay.js ready');
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load payment processor');
          Logger.error('Failed to load HelcimPay.js', { error: err });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const initializeFields = useCallback(
    async (containerId: string, initialAmount: number, frequency: DonationFrequency): Promise<void> => {
      // Prevent double initialization
      if (initStateRef.current.containerId === containerId && fieldsReady) {
        Logger.info('Helcim fields already initialized for this container');
        return;
      }

      if (initializing) {
        Logger.info('Helcim fields initialization already in progress');
        return;
      }

      if (!scriptLoaded) {
        setError('Payment processor not loaded');
        return;
      }

      setInitializing(true);
      setError(null);

      try {
        // Step 1: Fetch checkout token from the server
        Logger.info('Fetching checkout token', { amount: initialAmount, frequency });
        const { checkoutToken } = await fetchHelcimCheckoutToken(initialAmount, frequency);

        // Step 2: Initialize Helcim fields with the token
        const testMode = import.meta.env.VITE_HELCIM_TEST_MODE === 'true';
        initializeHelcimFields(containerId, checkoutToken, initialAmount, testMode);

        // Track initialization state
        initStateRef.current = { containerId, checkoutToken, frequency };
        setFieldsReady(true);
        Logger.info('Helcim fields initialized', { containerId });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize payment fields';
        setError(message);
        setFieldsReady(false);
        Logger.error('Failed to initialize Helcim fields', { error: err });
      } finally {
        setInitializing(false);
      }
    },
    [scriptLoaded, fieldsReady, initializing]
  );

  const updateAmount = useCallback((amount: number): void => {
    if (fieldsReady) {
      updateHelcimAmount(amount);
    }
  }, [fieldsReady]);

  const processFiatPayment = useCallback(
    async (data: Omit<FiatPaymentData, 'checkoutToken'>): Promise<HelcimPaymentResult> => {
      if (!fieldsReady) {
        throw new Error('Payment fields not ready');
      }

      setLoading(true);
      setError(null);

      try {
        // Get checkout token from hosted fields
        const checkoutToken = await submitHelcimFields();

        const paymentData: FiatPaymentData = {
          ...data,
          checkoutToken,
        };

        // Process payment or create subscription based on frequency
        if (data.frequency === 'monthly') {
          const result = await createSubscription(paymentData);

          // Return a compatible result format
          return {
            transactionId: result.subscriptionId,
            approvalCode: '',
            amountCents: Math.round(data.amount * 100),
            receiptUrl: undefined,
          };
        } else {
          return await processPayment(paymentData);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Payment processing failed';
        setError(message);
        Logger.error('Fiat payment error', { error: err });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fieldsReady]
  );

  return {
    processFiatPayment,
    loading,
    error,
    clearError,
    initializeFields,
    updateAmount,
    fieldsReady,
    initializing,
  };
}
