/**
 * Helcim payment service client
 * @module helcimService
 * @description Client-side service for interacting with Helcim through Supabase edge functions.
 */

import { Logger } from '@/utils/logger';
import { ENV } from '@/config/env';
import type { FiatPaymentData, HelcimPaymentResult, DonationFrequency } from '@/components/web3/donation/types/donation';

/** Base URL for Supabase edge functions */
const SUPABASE_URL = ENV.SUPABASE_URL;

/** Supabase anon key for edge function authorization */
const SUPABASE_ANON_KEY = ENV.SUPABASE_ANON_KEY;

/** Common headers for Supabase edge function requests */
const getHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
});

/** Response from the helcim-pay initialization endpoint */
interface HelcimPayInitResponse {
  success: boolean;
  checkoutToken?: string;
  secretToken?: string;
  error?: string;
}

/** Payment response from the edge function */
interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  approvalCode?: string;
  cardType?: string;
  cardLastFour?: string;
  error?: string;
}

/** Subscription response from the edge function */
interface SubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  customerId?: string;
  status?: string;
  nextBillingDate?: string;
  error?: string;
}

/**
 * Process a one-time card payment through Helcim
 * @param data - Payment data including checkout token from Helcim hosted fields
 * @returns Payment result with transaction details
 * @throws Error if payment fails
 */
export async function processPayment(data: FiatPaymentData): Promise<HelcimPaymentResult> {
  Logger.info('Processing fiat payment', {
    charityId: data.charityId,
    amount: data.amount,
    coverFees: data.coverFees,
  });

  const response = await fetch(`${SUPABASE_URL}/functions/v1/helcim-payment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      checkoutToken: data.checkoutToken,
      amount: Math.round(data.amount * 100), // Convert to cents
      charityId: data.charityId,
      charityName: data.charityName,
      donorName: data.name,
      donorEmail: data.email,
      coverFees: data.coverFees,
    }),
  });

  const result: PaymentResponse = await response.json();

  if (!response.ok || !result.success) {
    Logger.error('Fiat payment failed', {
      status: response.status,
      error: result.error,
    });
    throw new Error(result.error || 'Payment processing failed');
  }

  Logger.info('Fiat payment successful', {
    transactionId: result.transactionId,
  });

  return {
    transactionId: result.transactionId || '',
    approvalCode: result.approvalCode || '',
    amountCents: Math.round(data.amount * 100),
    cardType: result.cardType,
    cardLastFour: result.cardLastFour,
  };
}

/**
 * Create a monthly subscription through Helcim
 * @param data - Payment data including checkout token from Helcim hosted fields
 * @returns Subscription result with subscription ID
 * @throws Error if subscription creation fails
 */
export async function createSubscription(data: FiatPaymentData): Promise<{
  subscriptionId: string;
  customerId: string;
  nextBillingDate: string;
}> {
  Logger.info('Creating fiat subscription', {
    charityId: data.charityId,
    amount: data.amount,
    coverFees: data.coverFees,
  });

  const response = await fetch(`${SUPABASE_URL}/functions/v1/helcim-subscription`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      checkoutToken: data.checkoutToken,
      amount: Math.round(data.amount * 100), // Convert to cents
      charityId: data.charityId,
      charityName: data.charityName,
      donorName: data.name,
      donorEmail: data.email,
      coverFees: data.coverFees,
    }),
  });

  const result: SubscriptionResponse = await response.json();

  if (!response.ok || !result.success) {
    Logger.error('Fiat subscription failed', {
      status: response.status,
      error: result.error,
    });
    throw new Error(result.error || 'Subscription creation failed');
  }

  Logger.info('Fiat subscription created', {
    subscriptionId: result.subscriptionId,
  });

  return {
    subscriptionId: result.subscriptionId || '',
    customerId: result.customerId || '',
    nextBillingDate: result.nextBillingDate || '',
  };
}

/**
 * Fetch a checkout token from the Helcim Pay initialization endpoint
 * @param amount - Payment amount in dollars
 * @param frequency - Donation frequency (once or monthly)
 * @returns Checkout token for initializing HelcimPay.js
 * @throws Error if token fetch fails
 */
export async function fetchHelcimCheckoutToken(
  amount: number,
  frequency: DonationFrequency
): Promise<{ checkoutToken: string; secretToken: string }> {
  Logger.info('Fetching Helcim checkout token', { amount, frequency });

  const response = await fetch(`${SUPABASE_URL}/functions/v1/helcim-pay`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      amount,
      currency: 'USD',
      donationType: frequency === 'monthly' ? 'subscription' : 'one-time',
    }),
  });

  const result: HelcimPayInitResponse = await response.json();

  if (!response.ok || !result.success) {
    const errorMessage = result.error || 'Failed to initialize payment form';
    Logger.error('Failed to fetch checkout token', { status: response.status, error: errorMessage });
    throw new Error(errorMessage);
  }

  if (!result.checkoutToken) {
    throw new Error('No checkout token received');
  }

  Logger.info('Checkout token received');

  return {
    checkoutToken: result.checkoutToken,
    secretToken: result.secretToken || '',
  };
}

/** HelcimPay.js configuration */
export interface HelcimConfig {
  /** Container element ID for hosted fields */
  containerId: string;
  /** Callback when checkout token is received */
  onToken: (_token: string) => void;
  /** Callback when an error occurs */
  onError: (_error: string) => void;
  /** Optional CSS customization */
  styles?: Record<string, string>;
}

/** Global HelcimPay interface */
declare global {
  interface Window {
    HelcimPay?: {
      init: (_config: {
        token: string;
        test: boolean;
        amount: number;
        currency: string;
        customerCode?: string;
        avs?: boolean;
        'css-url'?: string;
      }) => void;
      setAmount: (_amount: number) => void;
      appendTo: (_elementId: string) => void;
      on: (_event: string, _callback: (_data: unknown) => void) => void;
      validate: () => Promise<boolean>;
      submit: () => Promise<{ cardToken: string }>;
    };
  }
}

/**
 * Poll for `window.HelcimPay` after the script's `onload` fires.
 * The global may not be assigned synchronously when the script finishes downloading.
 * Uses async/await polling with a generous timeout for slow connections.
 * @returns Promise that resolves when `window.HelcimPay` is available
 */
function waitForHelcimGlobal(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.HelcimPay) {
      resolve();
      return;
    }

    const pollInterval = 200; // ms
    const maxWait = 10000; // 10s - generous for slow connections
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += pollInterval;
      if (window.HelcimPay) {
        clearInterval(timer);
        Logger.info(`HelcimPay.js global detected after ${elapsed}ms`);
        resolve();
      } else if (elapsed >= maxWait) {
        clearInterval(timer);
        reject(new Error(
          `HelcimPay.js global not available after ${maxWait}ms. ` +
          'Check CSP script-src includes https://secure.helcim.app and https://api.helcim.com'
        ));
      }
    }, pollInterval);
  });
}

/**
 * Load HelcimPay.js script dynamically
 * @returns Promise that resolves when script is loaded and the global is available
 */
/** Track script loading state to prevent double-loading */
let helcimScriptPromise: Promise<void> | null = null;

export function loadHelcimScript(): Promise<void> {
  // Return existing promise if script is already loading
  if (helcimScriptPromise) {
    return helcimScriptPromise;
  }

  // Check if already loaded and available
  if (window.HelcimPay) {
    return Promise.resolve();
  }

  // Check if script tag already exists
  const existingScript = document.querySelector('script[src*="helcim-pay"]') as HTMLScriptElement | null;
  if (existingScript) {
    // Script tag exists - wait for it to load
    helcimScriptPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.HelcimPay) {
        resolve();
        return;
      }

      // Wait for load event, then poll for global
      const handleLoad = (): void => {
        Logger.info('HelcimPay.js script loaded (existing script), waiting for global');
        waitForHelcimGlobal()
          .then(() => {
            Logger.info('HelcimPay.js global ready (existing script)');
            resolve();
          })
          .catch((err) => {
            Logger.error('HelcimPay.js global not available after load', { error: err });
            helcimScriptPromise = null;
            reject(err);
          });
      };

      const handleError = (): void => {
        Logger.error('Failed to load HelcimPay.js (existing script)');
        helcimScriptPromise = null;
        reject(new Error('Failed to load payment processor'));
      };

      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);
    });

    return helcimScriptPromise;
  }

  helcimScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://secure.helcim.app/helcim-pay/services/start.js';

    script.onload = () => {
      Logger.info('HelcimPay.js script loaded, waiting for global');
      waitForHelcimGlobal()
        .then(() => {
          Logger.info('HelcimPay.js global ready');
          resolve();
        })
        .catch((err) => {
          Logger.error('HelcimPay.js global not available after load', { error: err });
          helcimScriptPromise = null;
          reject(err);
        });
    };

    script.onerror = () => {
      Logger.error('Failed to load HelcimPay.js');
      helcimScriptPromise = null; // Reset on error to allow retry
      reject(new Error('Failed to load payment processor'));
    };

    document.head.appendChild(script);
  });

  return helcimScriptPromise;
}

/**
 * Reset the module-level script promise so a fresh load can be attempted.
 * Used by the retry mechanism in useFiatDonation.
 */
export function resetHelcimScriptState(): void {
  helcimScriptPromise = null;
}

/**
 * Initialize Helcim hosted fields with a checkout token
 * @param containerId - DOM element ID to render fields into
 * @param checkoutToken - Checkout token from helcim-pay edge function
 * @param amount - Initial amount in dollars
 * @param testMode - Whether to use test mode
 */
export function initializeHelcimFields(
  containerId: string,
  checkoutToken: string,
  amount: number,
  testMode = true
): void {
  if (!window.HelcimPay) {
    throw new Error('HelcimPay.js not loaded');
  }

  if (!checkoutToken) {
    throw new Error('Checkout token is required');
  }

  window.HelcimPay.init({
    token: checkoutToken,
    test: testMode,
    amount,
    currency: 'USD',
    avs: true,
  });

  window.HelcimPay.appendTo(containerId);
}

/**
 * Update the amount in Helcim hosted fields
 * @param amount - New amount in dollars
 */
export function updateHelcimAmount(amount: number): void {
  if (window.HelcimPay) {
    window.HelcimPay.setAmount(amount);
  }
}

/**
 * Validate and submit Helcim hosted fields
 * @returns Promise with the checkout token
 */
export async function submitHelcimFields(): Promise<string> {
  if (!window.HelcimPay) {
    throw new Error('HelcimPay.js not loaded');
  }

  const isValid = await window.HelcimPay.validate();
  if (!isValid) {
    throw new Error('Please check your card details');
  }

  const result = await window.HelcimPay.submit();
  return result.cardToken;
}
