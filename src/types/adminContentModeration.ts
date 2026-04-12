/**
 * Visibility/moderation status for opportunities and causes.
 * - visible: publicly accessible, no moderation action taken
 * - hidden: hidden from public view by admin (requires reason)
 * - flagged: flagged for further review by admin
 */
export type ModerationStatus = "visible" | "hidden" | "flagged";

/** A single opportunity row returned by admin_list_opportunities RPC */
export interface AdminOpportunityListItem {
  id: string;
  charityId: string;
  charityName: string;
  title: string;
  status: string;
  moderationStatus: ModerationStatus;
  moderationReason: string | null;
  moderatedAt: string | null;
  updatedAt: string;
}

/** A single cause row returned by admin_list_causes RPC */
export interface AdminCauseListItem {
  id: string;
  charityId: string;
  charityName: string;
  title: string;
  status: string;
  moderationStatus: ModerationStatus;
  moderationReason: string | null;
  moderatedAt: string | null;
  updatedAt: string;
}

/** Filters for admin_list_opportunities and admin_list_causes RPCs */
export interface AdminContentModerationFilters {
  moderationStatus?: ModerationStatus;
  search?: string;
  charityId?: string;
  page?: number;
  limit?: number;
}

/** Paginated result from admin_list_opportunities */
export interface AdminOpportunityListResult {
  opportunities: AdminOpportunityListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Paginated result from admin_list_causes */
export interface AdminCauseListResult {
  causes: AdminCauseListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Moderation action types */
export type ModerationAction = "hide" | "unhide" | "flag" | "unflag";

/** Input for admin_moderate_content RPC */
export interface AdminModerateContentInput {
  contentType: "opportunity" | "cause";
  contentId: string;
  action: ModerationAction;
  reason?: string;
}

/** Input for admin_cascade_charity_moderation RPC */
export interface AdminCascadeCharityModerationInput {
  charityId: string;
  action: ModerationAction;
  reason?: string;
}

/** Raw database row returned by admin_list_opportunities RPC (snake_case) */
export interface AdminOpportunityListRow {
  id: string;
  charity_id: string;
  charity_name: string;
  title: string;
  status: string;
  moderation_status: string;
  moderation_reason: string | null;
  moderated_at: string | null;
  updated_at: string;
  total_count: number;
}

/** Raw database row returned by admin_list_causes RPC (snake_case) */
export interface AdminCauseListRow {
  id: string;
  charity_id: string;
  charity_name: string;
  title: string;
  status: string;
  moderation_status: string;
  moderation_reason: string | null;
  moderated_at: string | null;
  updated_at: string;
  total_count: number;
}
