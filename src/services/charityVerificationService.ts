import { supabase } from "@/lib/supabase";
import { Logger } from "@/utils/logger";

/**
 * Admin-managed verification status values for a charity.
 * Mirrors AdminCharityVerificationStatus but exposed to charity users.
 */
export type CharityVerificationStatus =
  | "pending"
  | "approved"
  | "verified"
  | "rejected"
  | "suspended";

/** Result returned by get_charity_verification_status RPC */
export interface CharityVerificationResult {
  status: CharityVerificationStatus;
  reviewNotes: string | null;
}

/** Raw row returned by the Supabase RPC */
interface VerificationStatusRow {
  status: string;
  review_notes: string | null;
}

/**
 * Fetches the charity verification status for the authenticated user.
 * Calls the `get_charity_verification_status` RPC which returns the status
 * and review notes for the calling user's own charity profile only.
 *
 * @param userId - The authenticated user's ID
 * @returns CharityVerificationResult with status and reviewNotes, or null if not found / on error
 */
export async function getCharityVerificationStatus(
  userId: string,
): Promise<CharityVerificationResult | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase.rpc(
      "get_charity_verification_status",
      { p_user_id: userId },
    );

    if (error) {
      Logger.error("Error fetching charity verification status", {
        error,
        userId,
      });
      return null;
    }

    const rows = data as VerificationStatusRow[] | null;
    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    return {
      status: row.status as CharityVerificationStatus,
      reviewNotes: row.review_notes,
    };
  } catch (err) {
    Logger.error("Exception fetching charity verification status", {
      error: err instanceof Error ? err.message : String(err),
      userId,
    });
    return null;
  }
}
