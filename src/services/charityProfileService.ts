import { supabase } from "@/lib/supabase";
import type { CharityProfile } from "@/types/charityProfile";
import { Logger } from "@/utils/logger";

interface ClaimCharityParams {
  ein: string;
  signerName: string;
  signerEmail: string;
  signerPhone: string;
}

/**
 * Claims an unclaimed charity profile by EIN via the claim_charity_profile RPC.
 * Sets the profile status to 'claimed-pending' and records the authorized signer details.
 * @param params - The claim parameters including EIN and signer contact info
 * @returns The updated charity profile or null on error
 */
export async function claimCharityProfile(
  params: ClaimCharityParams,
): Promise<CharityProfile | null> {
  try {
    const { data, error } = await supabase.rpc("claim_charity_profile", {
      p_ein: params.ein,
      p_signer_name: params.signerName,
      p_signer_email: params.signerEmail,
      p_signer_phone: params.signerPhone,
    });

    if (error) {
      Logger.error("Error claiming charity profile", {
        error,
        ein: params.ein,
      });
      return null;
    }

    const rows = (data || []) as CharityProfile[];
    return rows[0] || null;
  } catch (error) {
    Logger.error("Charity profile claim failed", {
      error: error instanceof Error ? error.message : String(error),
      ein: params.ein,
    });
    return null;
  }
}

/**
 * Fetches the wallet address stored on a charity profile for a given user.
 * Queries charity_profiles by claimed_by (the user who claimed the profile).
 * @param userId - The authenticated user's ID
 * @returns The wallet address string, or null if not set or not found
 */
export async function getCharityWalletAddress(
  userId: string,
): Promise<string | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("charity_profiles")
      .select("wallet_address")
      .eq("claimed_by", userId)
      .single();

    if (error || !data) {
      return null;
    }
    const row = data as { wallet_address: string | null };
    return row.wallet_address;
  } catch (err) {
    Logger.error("Charity wallet address fetch failed", {
      error: err instanceof Error ? err.message : String(err),
      userId,
    });
    return null;
  }
}

/**
 * Stores a receiving wallet address on the charity profile for a given user.
 * Updates the charity_profiles row where claimed_by matches the user ID.
 * @param userId - The authenticated user's ID (matched via claimed_by)
 * @param walletAddress - The blockchain wallet address to persist
 * @returns True if the update succeeded, false otherwise
 */
export async function updateCharityWalletAddress(
  userId: string,
  walletAddress: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("charity_profiles")
      .update({ wallet_address: walletAddress })
      .eq("claimed_by", userId);

    if (error) {
      Logger.error("Error updating charity wallet address", { error, userId });
      return false;
    }
    return true;
  } catch (err) {
    Logger.error("Charity wallet update failed", {
      error: err instanceof Error ? err.message : String(err),
      userId,
    });
    return false;
  }
}

/**
 * Fetches or creates a charity profile by EIN via the get_or_create_charity_profile RPC.
 * Returns null if the EIN is empty, not found in IRS records, or on error.
 * @param ein - The Employer Identification Number to look up
 * @returns The charity profile or null
 */
export async function getCharityProfileByEin(
  ein: string,
): Promise<CharityProfile | null> {
  const trimmed = ein?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const { data, error } = await supabase.rpc(
      "get_or_create_charity_profile",
      {
        lookup_ein: trimmed,
      },
    );

    if (error) {
      Logger.error("Error fetching charity profile", { error, ein: trimmed });
      return null;
    }

    const rows = (data || []) as CharityProfile[];
    return rows[0] || null;
  } catch (error) {
    Logger.error("Charity profile fetch failed", {
      error: error instanceof Error ? error.message : String(error),
      ein: trimmed,
    });
    return null;
  }
}
