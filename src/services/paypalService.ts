/**
 * PayPal service for non-USD international donations.
 * @module paypalService
 * @description Creates PayPal orders and captures payments via Supabase edge functions.
 * Mirrors the pattern of helcimService.ts for consistency.
 */

import { supabase } from '@/lib/supabase';
import { Logger } from '@/utils/logger';

interface PayPalOrderRequest {
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

interface PayPalOrderResponse {
  orderId: string;
  approvalUrl: string;
}

interface PayPalCaptureResponse {
  success: boolean;
  transactionId?: string;
  amount?: number;
  currency?: string;
}

/**
 * Creates a PayPal order via the paypal-create-order edge function.
 * @param {PayPalOrderRequest} params - Order parameters
 * @returns {Promise<PayPalOrderResponse>} Order ID and approval URL for the PayPal popup
 * @throws {Error} If order creation fails
 */
export async function createPayPalOrder(
  params: PayPalOrderRequest,
): Promise<PayPalOrderResponse> {
  Logger.info('Creating PayPal order', {
    amount: params.amount,
    currency: params.currency,
  });

  const { data, error } = await supabase.functions.invoke('paypal-create-order', {
    body: params,
  });

  if (error) {
    Logger.error('PayPal create order edge function error', { error });
    throw new Error('Failed to create PayPal order');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Failed to create PayPal order');
  }

  Logger.info('PayPal order created', { orderId: data.orderId });

  return {
    orderId: data.orderId,
    approvalUrl: data.approvalUrl,
  };
}

/**
 * Captures a PayPal order after donor approval via the paypal-capture-order edge function.
 * @param {string} orderId - PayPal order ID to capture
 * @returns {Promise<PayPalCaptureResponse>} Capture result with transaction details
 * @throws {Error} If capture fails
 */
export async function capturePayPalOrder(
  orderId: string,
): Promise<PayPalCaptureResponse> {
  Logger.info('Capturing PayPal order', { orderId });

  const { data, error } = await supabase.functions.invoke('paypal-capture-order', {
    body: { orderId },
  });

  if (error) {
    Logger.error('PayPal capture edge function error', { error });
    throw new Error('Failed to capture PayPal payment');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Failed to capture PayPal payment');
  }

  Logger.info('PayPal payment captured', { transactionId: data.transactionId });

  return {
    success: true,
    transactionId: data.transactionId,
    amount: data.amount,
    currency: data.currency,
  };
}
