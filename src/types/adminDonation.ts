/**
 * Payment method for a donation in the admin view.
 * - crypto: on-chain donation via the smart contract
 * - fiat: off-chain donation via PayPal or similar processor
 */
export type DonationPaymentMethod = "crypto" | "fiat";

/** A single unified donation row from admin_list_donations RPC */
export interface AdminDonationListItem {
  id: string;
  paymentMethod: DonationPaymentMethod;
  /** Amount in native token units (crypto) or cents (fiat) */
  amount: number;
  /** USD equivalent at time of donation */
  amountUsd: number | null;
  currency: string | null;
  charityId: string;
  charityName: string | null;
  donorUserId: string | null;
  donorEmail: string | null;
  donorDisplayName: string | null;
  /** Transaction hash for crypto donations */
  txHash: string | null;
  /** Processor-assigned ID for fiat donations */
  processorId: string | null;
  status: string | null;
  isFlagged: boolean;
  openFlagCount: number;
  createdAt: string;
}

/** Filters for admin_list_donations RPC */
export interface AdminDonationListFilters {
  paymentMethod?: DonationPaymentMethod;
  charityId?: string;
  donorUserId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmountUsd?: number;
  maxAmountUsd?: number;
  flagged?: boolean;
  page?: number;
  limit?: number;
}

/** Paginated result from admin_list_donations */
export interface AdminDonationListResult {
  donations: AdminDonationListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Aggregated summary row from admin_donation_summary RPC */
export interface AdminDonationSummaryRow {
  groupKey: string;
  paymentMethod: DonationPaymentMethod;
  totalAmountUsd: number;
  donationCount: number;
  charityId: string | null;
  charityName: string | null;
}

/** A donation flag record */
export interface AdminDonationFlag {
  id: string;
  donationId: string;
  donationType: DonationPaymentMethod;
  flagReason: string;
  flaggedBy: string;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

/** Input for admin_flag_donation RPC */
export interface AdminFlagDonationInput {
  donationId: string;
  donationType: DonationPaymentMethod;
  reason: string;
}

/** Input for admin_resolve_flag RPC */
export interface AdminResolveFlagInput {
  flagId: string;
  resolutionNote?: string;
}

/** Group-by options for admin_donation_summary */
export type DonationSummaryGroupBy = "charity" | "day" | "week" | "month" | "payment_method";

/** Raw database row returned by admin_list_donations RPC (snake_case) */
export interface AdminDonationListRow {
  id: string;
  payment_method: string;
  amount: number;
  amount_usd: number | null;
  currency: string | null;
  charity_id: string;
  charity_name: string | null;
  donor_user_id: string | null;
  donor_email: string | null;
  donor_display_name: string | null;
  tx_hash: string | null;
  processor_id: string | null;
  status: string | null;
  is_flagged: boolean;
  open_flag_count: number;
  created_at: string;
  total_count: number;
}
