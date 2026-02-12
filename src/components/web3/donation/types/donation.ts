/**
 * Shared TypeScript types for the donation system
 * @module donation/types
 */

/** Payment method selection */
export type PaymentMethod = "crypto" | "card";

/** Donation frequency */
export type DonationFrequency = "once" | "monthly";

/** Modal step in the donation flow */
export type ModalStep = "input" | "processing" | "success" | "error";

/** Result from a successful donation */
export interface DonationResult {
  /** Transaction hash (crypto) or payment ID (fiat) */
  transactionId: string;
  /** Amount donated in original currency */
  amount: number;
  /** Currency code (USD for fiat, token symbol for crypto) */
  currency: string;
  /** Payment method used */
  paymentMethod: PaymentMethod;
  /** Whether this is a recurring donation */
  isRecurring: boolean;
  /** Timestamp of the donation */
  timestamp: Date;
}

/** Result from Helcim payment processing */
export interface HelcimPaymentResult {
  /** Helcim transaction ID */
  transactionId: string;
  /** Approval code from the payment processor */
  approvalCode: string;
  /** Amount charged in cents */
  amountCents: number;
  /** Card type (visa, mastercard, etc.) */
  cardType?: string;
  /** Last four digits of the card */
  cardLastFour?: string;
  /** Receipt URL for the transaction */
  receiptUrl?: string;
}

/** Data required for fiat payment processing */
export interface FiatPaymentData {
  /** Donor's full name */
  name: string;
  /** Donor's email for receipt */
  email: string;
  /** Amount in dollars */
  amount: number;
  /** Whether donor opted to cover processing fees */
  coverFees: boolean;
  /** Charity ID for metadata */
  charityId: string;
  /** Charity name for receipt */
  charityName: string;
  /** Payment frequency */
  frequency: DonationFrequency;
  /** Helcim checkout token from hosted fields */
  checkoutToken: string;
}

/** Props for the unified DonationModal */
export interface DonationModalProps {
  /** Display name of the charity */
  charityName: string;
  /** Blockchain address of the charity */
  charityAddress: string;
  /** Unique ID for the charity (for Helcim metadata) */
  charityId: string;
  /** Donation frequency - determines modal mode (locked on open) */
  frequency: DonationFrequency;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Optional callback after successful donation */
  onSuccess?: (_result: DonationResult) => void;
}

/** State for the donation modal reducer */
export interface DonationModalState {
  /** Current payment method */
  paymentMethod: PaymentMethod;
  /** Donation frequency */
  frequency: DonationFrequency;
  /** Current step in the flow */
  step: ModalStep;
  /** Amount to donate in fiat (USD) */
  amount: number;
  /** Whether to cover processing fees */
  coverFees: boolean;
  /** Error message if any */
  error: string | null;
  /** Result after successful donation */
  result: DonationResult | null;
}

/** Actions for the donation modal reducer */
export type DonationModalAction =
  | { type: "SET_PAYMENT_METHOD"; payload: PaymentMethod }
  | { type: "SET_FREQUENCY"; payload: DonationFrequency }
  | { type: "SET_AMOUNT"; payload: number }
  | { type: "SET_COVER_FEES"; payload: boolean }
  | { type: "START_PROCESSING" }
  | { type: "SET_SUCCESS"; payload: DonationResult }
  | { type: "SET_ERROR"; payload: string }
  | { type: "RESET" };

/** Fee calculation constants */
export const FEE_PERCENTAGE = 0.03; // 3%

/**
 * Calculate fee offset for covering processing fees
 * @param amount - Base amount in dollars
 * @returns Object with fee amount and total
 */
export function calculateFeeOffset(amount: number): {
  fee: number;
  total: number;
} {
  const fee = Math.round(amount * FEE_PERCENTAGE * 100) / 100;
  return { fee, total: amount + fee };
}
