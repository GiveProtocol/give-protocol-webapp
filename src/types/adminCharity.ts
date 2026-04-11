/**
 * Charity verification status values managed by the admin workflow.
 * - pending: awaiting admin review
 * - verified/approved: admin approved the charity
 * - rejected: admin rejected the verification request
 * - suspended: admin suspended a previously approved charity
 */
export type AdminCharityVerificationStatus =
  | "pending"
  | "verified"
  | "approved"
  | "rejected"
  | "suspended";

/** A single charity row returned by admin_list_charities RPC */
export interface AdminCharityListItem {
  id: string;
  userId: string | null;
  name: string;
  category: string | null;
  logoUrl: string | null;
  mission: string | null;
  verificationId: string | null;
  verificationStatus: AdminCharityVerificationStatus;
  reviewNotes: string | null;
  reviewedAt: string | null;
  walletAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Filters for admin_list_charities RPC */
export interface AdminCharityListFilters {
  status?: AdminCharityVerificationStatus;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** Paginated result from admin_list_charities */
export interface AdminCharityListResult {
  charities: AdminCharityListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Input for admin_update_charity_status RPC */
export interface AdminCharityStatusUpdateInput {
  charityId: string;
  newStatus: AdminCharityVerificationStatus;
  reason?: string;
}

/** Raw database row returned by admin_list_charities RPC (snake_case) */
export interface AdminCharityListRow {
  id: string;
  user_id: string | null;
  name: string;
  category: string | null;
  logo_url: string | null;
  mission: string | null;
  verification_id: string | null;
  verification_status: string;
  review_notes: string | null;
  reviewed_at: string | null;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
  total_count: number;
}
