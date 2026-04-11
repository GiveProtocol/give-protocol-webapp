/**
 * Account status values for donor users managed by the admin workflow.
 * - active: normal access
 * - suspended: temporarily blocked from login
 * - banned: permanently blocked
 */
export type DonorUserStatus = "active" | "suspended" | "banned";

/** A single donor row returned by admin_list_donors RPC */
export interface AdminDonorListItem {
  userId: string;
  email: string | null;
  displayName: string | null;
  walletAddress: string | null;
  primaryAuthMethod: "email" | "wallet";
  userStatus: DonorUserStatus;
  totalCryptoUsd: number;
  totalFiatUsd: number;
  donationCount: number;
  createdAt: string;
}

/** Filters for admin_list_donors RPC */
export interface AdminDonorListFilters {
  status?: DonorUserStatus;
  authMethod?: "email" | "wallet";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minDonated?: number;
  page?: number;
  limit?: number;
}

/** Paginated result from admin_list_donors */
export interface AdminDonorListResult {
  donors: AdminDonorListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Compact crypto donation entry in donor detail */
export interface DonorCryptoDonation {
  id: string;
  amount: number;
  charityId: string;
  createdAt: string;
}

/** Compact fiat donation entry in donor detail */
export interface DonorFiatDonation {
  id: string;
  amountCents: number;
  currency: string;
  charityId: string;
  createdAt: string;
}

/** Status history entry in donor detail */
export interface DonorStatusHistoryEntry {
  id: string;
  previousStatus: string;
  newStatus: string;
  reason: string | null;
  adminUserId: string;
  createdAt: string;
}

/** Full donor detail returned by admin_get_donor_detail RPC */
export interface AdminDonorDetail {
  profile: {
    userId: string;
    email: string | null;
    displayName: string | null;
    userStatus: DonorUserStatus;
    createdAt: string;
  };
  identity: {
    walletAddress: string | null;
    primaryAuthMethod: "email" | "wallet";
    walletLinkedAt: string | null;
  };
  donationSummary: {
    cryptoDonationCount: number;
    cryptoTotalUsd: number;
    fiatDonationCount: number;
    fiatTotalUsd: number;
  };
  recentCryptoDonations: DonorCryptoDonation[];
  recentFiatDonations: DonorFiatDonation[];
  statusHistory: DonorStatusHistoryEntry[];
}

/** Input for admin_update_user_status RPC */
export interface AdminDonorStatusUpdateInput {
  userId: string;
  newStatus: DonorUserStatus;
  reason?: string;
}

/** Raw database row returned by admin_list_donors RPC (snake_case) */
export interface AdminDonorListRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  wallet_address: string | null;
  primary_auth_method: string;
  user_status: string;
  total_crypto_usd: number;
  total_fiat_usd: number;
  donation_count: number;
  created_at: string;
  total_count: number;
}
