import { supabase } from "@/lib/supabase";
import { Logger } from "@/utils/logger";

/**
 * Contribution source types
 */
export type ContributionSource =
  | "donation"
  | "fiat_donation"
  | "formal_volunteer"
  | "self_reported";

/**
 * Aggregated contribution stats for a user
 */
export interface UserContributionStats {
  userId: string;
  totalDonated: number;
  donationCount: number;
  totalFiatDonated: number;
  fiatDonationCount: number;
  formalVolunteerHours: number;
  selfReportedHours: {
    validated: number;
    pending: number;
    unvalidated: number;
    total: number;
  };
  totalVolunteerHours: number; // formal + validated self-reported
  skillsEndorsed: number;
  organizationsHelped: number;
}

/**
 * Unified contribution record for display
 */
export interface UnifiedContribution {
  id: string;
  type: ContributionSource;
  userId: string;
  date: string;
  organizationId?: string;
  organizationName: string;
  // Donation-specific
  amount?: number;
  // Volunteer-specific
  hours?: number;
  activityType?: string;
  description?: string;
  validationStatus?: string;
  // Fiat donation-specific
  paymentMethod?: string;
  disbursementStatus?: string;
  isFiatDonation?: boolean;
  // Common
  status: "completed" | "pending" | "validated" | "unvalidated";
  createdAt: string;
}

/**
 * Leaderboard entry for volunteers
 */
export interface VolunteerLeaderboardEntry {
  rank: number;
  userId: string;
  walletAddress?: string;
  alias?: string;
  totalHours: number;
  formalHours: number;
  selfReportedHours: number;
  endorsements: number;
  organizationsHelped: number;
}

/**
 * Leaderboard entry for donors
 */
export interface DonorLeaderboardEntry {
  rank: number;
  userId: string;
  walletAddress?: string;
  alias?: string;
  totalDonated: number;
  donationCount: number;
  organizationsSupported: number;
}

/**
 * Filter options for contributions
 */
export interface ContributionFilters {
  userId?: string;
  organizationId?: string;
  sources?: ContributionSource[];
  dateFrom?: string;
  dateTo?: string;
  validationStatus?: string[];
}

/**
 * Fetches aggregated contribution stats for a user
 * @param userId - The user's ID
 * @returns UserContributionStats object
 */
export async function getUserContributionStats(
  userId: string,
): Promise<UserContributionStats> {
  try {
    // Fetch crypto donations
    const { data: donations, error: donationsError } = await supabase
      .from("donations")
      .select("amount")
      .eq("donor_id", userId);

    if (donationsError) {
      Logger.warn("Error fetching donations for stats", {
        error: donationsError,
        userId,
      });
    }

    // Fetch fiat donations
    const { data: fiatDonations, error: fiatDonationsError } = await supabase
      .from("fiat_donations")
      .select("amount_cents")
      .eq("donor_id", userId);

    if (fiatDonationsError) {
      Logger.warn("Error fetching fiat donations for stats", {
        error: fiatDonationsError,
        userId,
      });
    }

    // Fetch formal volunteer hours (approved only)
    const { data: formalHours, error: formalError } = await supabase
      .from("volunteer_hours")
      .select("hours, charity_id")
      .eq("volunteer_id", userId)
      .eq("status", "approved");

    if (formalError) {
      Logger.warn("Error fetching formal volunteer hours", {
        error: formalError,
        userId,
      });
    }

    // Fetch self-reported hours
    const { data: selfReported, error: selfReportedError } = await supabase
      .from("self_reported_hours")
      .select("hours, validation_status, organization_id, organization_name")
      .eq("volunteer_id", userId);

    if (selfReportedError) {
      Logger.warn("Error fetching self-reported hours", {
        error: selfReportedError,
        userId,
      });
    }

    // Fetch skill endorsements
    const { data: endorsements, error: endorsementsError } = await supabase
      .from("skill_endorsements")
      .select("id")
      .eq("recipient_id", userId);

    if (endorsementsError) {
      Logger.warn("Error fetching endorsements", {
        error: endorsementsError,
        userId,
      });
    }

    // Calculate crypto donation stats
    const totalDonated =
      donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const donationCount = donations?.length || 0;

    // Calculate fiat donation stats
    const totalFiatDonated =
      fiatDonations?.reduce((sum, d) => sum + (d.amount_cents || 0), 0) / 100 || 0;
    const fiatDonationCount = fiatDonations?.length || 0;

    // Calculate formal volunteer hours
    const formalVolunteerHours =
      formalHours?.reduce((sum, h) => sum + (h.hours || 0), 0) || 0;

    // Calculate self-reported hours by status
    const selfReportedStats = {
      validated: 0,
      pending: 0,
      unvalidated: 0,
      total: 0,
    };

    selfReported?.forEach((record) => {
      const hours = record.hours || 0;
      selfReportedStats.total += hours;

      switch (record.validation_status) {
        case "validated": {
          selfReportedStats.validated += hours;
          break;
        }
        case "pending": {
          selfReportedStats.pending += hours;
          break;
        }
        default: {
          selfReportedStats.unvalidated += hours;
          break;
        }
      }
    });

    // Count unique organizations
    const orgIds = new Set<string>();
    formalHours?.forEach((h) => {
      if (h.charity_id) orgIds.add(h.charity_id);
    });
    selfReported?.forEach((h) => {
      if (h.organization_id) orgIds.add(h.organization_id);
      // Count unique organization names for unverified orgs
      if (h.organization_name && !h.organization_id) {
        orgIds.add(`name:${h.organization_name}`);
      }
    });

    return {
      userId,
      totalDonated,
      donationCount,
      totalFiatDonated,
      fiatDonationCount,
      formalVolunteerHours,
      selfReportedHours: selfReportedStats,
      totalVolunteerHours: formalVolunteerHours + selfReportedStats.validated,
      skillsEndorsed: endorsements?.length || 0,
      organizationsHelped: orgIds.size,
    };
  } catch (error) {
    Logger.error("Error fetching user contribution stats", { error, userId });
    throw new Error("Failed to fetch contribution stats");
  }
}

/**
 * Fetches donation contributions
 */
async function fetchDonationContributions(
  filters: ContributionFilters,
): Promise<UnifiedContribution[]> {
  let query = supabase.from("donations").select(`
    id, amount, created_at, donor_id, charity_id,
    charity:charity_id ( charity_details ( name ) )
  `);

  if (filters.userId) query = query.eq("donor_id", filters.userId);
  if (filters.organizationId)
    query = query.eq("charity_id", filters.organizationId);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  const { data, error } = await query;

  if (error) {
    Logger.warn("Error fetching donations", { error });
    return [];
  }

  return (data || []).map((d) => {
    const charityData = d.charity as {
      charity_details?: { name?: string };
    } | null;
    return {
      id: d.id,
      type: "donation" as const,
      userId: d.donor_id,
      date: d.created_at,
      organizationId: d.charity_id,
      organizationName: charityData?.charity_details?.name || "Unknown Charity",
      amount: d.amount,
      status: "completed" as const,
      createdAt: d.created_at,
    };
  });
}

/**
 * Fetches fiat donation contributions from the fiat_donations table
 */
async function fetchFiatDonationContributions(
  filters: ContributionFilters,
): Promise<UnifiedContribution[]> {
  let query = supabase.from("fiat_donations").select(`
    id, amount_cents, currency, payment_method, transaction_id,
    card_last_four, donor_name, disbursement_status, status,
    created_at, donor_id, charity_id,
    charity:charity_id ( charity_details ( name ) )
  `);

  if (filters.userId) query = query.eq("donor_id", filters.userId);
  if (filters.organizationId)
    query = query.eq("charity_id", filters.organizationId);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  const { data, error } = await query;

  if (error) {
    Logger.warn("Error fetching fiat donations", { error });
    return [];
  }

  return (data || []).map((d) => {
    const charityData = d.charity as {
      charity_details?: { name?: string };
    } | null;
    return {
      id: d.id,
      type: "fiat_donation" as const,
      userId: d.donor_id,
      date: d.created_at,
      organizationId: d.charity_id,
      organizationName: charityData?.charity_details?.name || "Unknown Charity",
      amount: d.amount_cents / 100,
      paymentMethod: d.payment_method,
      disbursementStatus: d.disbursement_status,
      isFiatDonation: true,
      status: (d.status === "completed" ? "completed" : "pending") as
        | "completed"
        | "pending",
      createdAt: d.created_at,
    };
  });
}

/**
 * Fetches formal volunteer hour contributions
 */
async function fetchFormalVolunteerContributions(
  filters: ContributionFilters,
): Promise<UnifiedContribution[]> {
  let query = supabase.from("volunteer_hours").select(`
    id, hours, date_performed, description, status, created_at, volunteer_id, charity_id
  `);

  if (filters.userId) query = query.eq("volunteer_id", filters.userId);
  if (filters.organizationId)
    query = query.eq("charity_id", filters.organizationId);
  if (filters.dateFrom) query = query.gte("date_performed", filters.dateFrom);
  if (filters.dateTo) query = query.lte("date_performed", filters.dateTo);

  const { data, error } = await query;

  if (error) {
    Logger.warn("Error fetching formal volunteer hours", { error });
    return [];
  }

  return (data || []).map((h) => ({
    id: h.id,
    type: "formal_volunteer" as const,
    userId: h.volunteer_id,
    date: h.date_performed,
    organizationId: h.charity_id,
    organizationName: "Organization",
    hours: h.hours,
    description: h.description,
    status: (h.status === "approved" ? "completed" : "pending") as
      | "completed"
      | "pending",
    createdAt: h.created_at,
  }));
}

/**
 * Maps validation status to unified contribution status
 */
function mapValidationStatus(
  validationStatus: string | null,
): UnifiedContribution["status"] {
  if (validationStatus === "validated") return "validated";
  if (validationStatus === "pending") return "pending";
  return "unvalidated";
}

/**
 * Fetches self-reported hour contributions
 */
async function fetchSelfReportedContributions(
  filters: ContributionFilters,
): Promise<UnifiedContribution[]> {
  let query = supabase.from("self_reported_hours").select(`
    id, hours, activity_date, activity_type, description,
    validation_status, created_at, volunteer_id, organization_id, organization_name
  `);

  if (filters.userId) query = query.eq("volunteer_id", filters.userId);
  if (filters.organizationId)
    query = query.eq("organization_id", filters.organizationId);
  if (filters.dateFrom) query = query.gte("activity_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("activity_date", filters.dateTo);
  if (filters.validationStatus && filters.validationStatus.length > 0) {
    query = query.in("validation_status", filters.validationStatus);
  }

  const { data, error } = await query;

  if (error) {
    Logger.warn("Error fetching self-reported hours", { error });
    return [];
  }

  return (data || []).map((h) => ({
    id: h.id,
    type: "self_reported" as const,
    userId: h.volunteer_id,
    date: h.activity_date,
    organizationId: h.organization_id || undefined,
    organizationName: h.organization_name || "Unknown Organization",
    hours: h.hours,
    activityType: h.activity_type,
    description: h.description,
    validationStatus: h.validation_status,
    status: mapValidationStatus(h.validation_status),
    createdAt: h.created_at,
  }));
}

/**
 * Fetches unified contributions for a user (all types combined)
 * @param filters - Filter options
 * @returns Array of UnifiedContribution objects
 */
export async function getUnifiedContributions(
  filters: ContributionFilters,
): Promise<UnifiedContribution[]> {
  const sources = filters.sources || [
    "donation",
    "fiat_donation",
    "formal_volunteer",
    "self_reported",
  ];

  try {
    const fetchPromises: Promise<UnifiedContribution[]>[] = [];

    if (sources.includes("donation")) {
      fetchPromises.push(fetchDonationContributions(filters));
    }
    if (sources.includes("fiat_donation")) {
      fetchPromises.push(fetchFiatDonationContributions(filters));
    }
    if (sources.includes("formal_volunteer")) {
      fetchPromises.push(fetchFormalVolunteerContributions(filters));
    }
    if (sources.includes("self_reported")) {
      fetchPromises.push(fetchSelfReportedContributions(filters));
    }

    const results = await Promise.all(fetchPromises);
    const contributions = results.flat();

    // Sort by date descending
    contributions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return contributions;
  } catch (error) {
    Logger.error("Error fetching unified contributions", { error, filters });
    throw new Error("Failed to fetch contributions");
  }
}

/**
 * Aggregates hours from a data array into a user hours map
 * @param data - Array of records with volunteer_id and hours
 * @param field - Which field to aggregate into ("formal" or "selfReported")
 * @param userHours - Map to aggregate into
 */
function aggregateHours(
  data: Array<{ volunteer_id: string; hours: number | null }> | null,
  field: "formal" | "selfReported",
  userHours: Map<string, { formal: number; selfReported: number; total: number }>,
): void {
  data?.forEach((record) => {
    const existing = userHours.get(record.volunteer_id) || {
      formal: 0,
      selfReported: 0,
      total: 0,
    };
    existing[field] += record.hours || 0;
    existing.total = existing.formal + existing.selfReported;
    userHours.set(record.volunteer_id, existing);
  });
}

/**
 * Fetches volunteer leaderboard data
 * @param limit - Maximum number of entries to return
 * @param includeUnvalidated - Whether to include unvalidated self-reported hours
 * @returns Array of VolunteerLeaderboardEntry objects
 */
export async function getVolunteerLeaderboard(
  limit = 10,
  includeUnvalidated = false,
): Promise<VolunteerLeaderboardEntry[]> {
  try {
    // Get formal volunteer hours aggregated by user
    const { data: formalData, error: formalError } = await supabase
      .from("volunteer_hours")
      .select("volunteer_id, hours")
      .eq("status", "approved");

    if (formalError) {
      Logger.warn("Error fetching formal hours for leaderboard", {
        error: formalError,
      });
    }

    // Get self-reported hours aggregated by user
    let selfReportedQuery = supabase
      .from("self_reported_hours")
      .select("volunteer_id, hours, validation_status");

    if (!includeUnvalidated) {
      selfReportedQuery = selfReportedQuery.eq(
        "validation_status",
        "validated",
      );
    }

    const { data: selfReportedData, error: selfReportedError } =
      await selfReportedQuery;

    if (selfReportedError) {
      Logger.warn("Error fetching self-reported hours for leaderboard", {
        error: selfReportedError,
      });
    }

    // Aggregate hours by user
    const userHours = new Map<
      string,
      { formal: number; selfReported: number; total: number }
    >();

    aggregateHours(formalData, "formal", userHours);
    aggregateHours(selfReportedData, "selfReported", userHours);

    // Convert to array and sort
    const entries: VolunteerLeaderboardEntry[] = Array.from(userHours.entries())
      .map(([userId, hours]) => ({
        rank: 0,
        userId,
        totalHours: hours.total,
        formalHours: hours.formal,
        selfReportedHours: hours.selfReported,
        endorsements: 0, // Would need separate query
        organizationsHelped: 0, // Would need separate query
      }))
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, limit)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return entries;
  } catch (error) {
    Logger.error("Error fetching volunteer leaderboard", { error });
    throw new Error("Failed to fetch volunteer leaderboard");
  }
}

/**
 * Fetches donor leaderboard data
 * @param limit - Maximum number of entries to return
 * @returns Array of DonorLeaderboardEntry objects
 */
export async function getDonorLeaderboard(
  limit = 10,
): Promise<DonorLeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from("donations")
      .select("donor_id, amount, charity_id");

    if (error) {
      Logger.warn("Error fetching donations for leaderboard", { error });
    }

    const { data: fiatData, error: fiatError } = await supabase
      .from("fiat_donations")
      .select("donor_id, amount_cents, charity_id");

    if (fiatError) {
      Logger.warn("Error fetching fiat donations for leaderboard", {
        error: fiatError,
      });
    }

    // Aggregate donations by user
    const userDonations = new Map<
      string,
      { total: number; count: number; charities: Set<string> }
    >();

    data?.forEach((record) => {
      const existing = userDonations.get(record.donor_id) || {
        total: 0,
        count: 0,
        charities: new Set<string>(),
      };
      existing.total += record.amount || 0;
      existing.count += 1;
      if (record.charity_id) {
        existing.charities.add(record.charity_id);
      }
      userDonations.set(record.donor_id, existing);
    });

    fiatData?.forEach((record) => {
      const existing = userDonations.get(record.donor_id) || {
        total: 0,
        count: 0,
        charities: new Set<string>(),
      };
      existing.total += (record.amount_cents || 0) / 100;
      existing.count += 1;
      if (record.charity_id) {
        existing.charities.add(record.charity_id);
      }
      userDonations.set(record.donor_id, existing);
    });

    // Convert to array and sort
    const entries: DonorLeaderboardEntry[] = Array.from(userDonations.entries())
      .map(([userId, stats]) => ({
        rank: 0,
        userId,
        totalDonated: stats.total,
        donationCount: stats.count,
        organizationsSupported: stats.charities.size,
      }))
      .sort((a, b) => b.totalDonated - a.totalDonated)
      .slice(0, limit)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return entries;
  } catch (error) {
    Logger.error("Error fetching donor leaderboard", { error });
    throw new Error("Failed to fetch donor leaderboard");
  }
}

/**
 * Fetches global contribution statistics
 * @returns Object with global stats
 */
export async function getGlobalContributionStats(): Promise<{
  totalDonations: number;
  totalDonationAmount: number;
  totalFormalVolunteerHours: number;
  totalSelfReportedHours: {
    validated: number;
    pending: number;
    total: number;
  };
  totalVolunteerHours: number;
  totalVolunteers: number;
  totalDonors: number;
  totalSkillsEndorsed: number;
}> {
  try {
    // Get crypto donation stats
    const { data: donations, error: donationsError } = await supabase
      .from("donations")
      .select("amount, donor_id");

    if (donationsError) {
      Logger.warn("Error fetching global donation stats", {
        error: donationsError,
      });
    }

    // Get fiat donation stats
    const { data: fiatDonations, error: fiatDonationsError } = await supabase
      .from("fiat_donations")
      .select("amount_cents, donor_id");

    if (fiatDonationsError) {
      Logger.warn("Error fetching global fiat donation stats", {
        error: fiatDonationsError,
      });
    }

    // Get formal volunteer hours
    const { data: formalHours, error: formalError } = await supabase
      .from("volunteer_hours")
      .select("hours, volunteer_id")
      .eq("status", "approved");

    if (formalError) {
      Logger.warn("Error fetching global formal hours", { error: formalError });
    }

    // Get self-reported hours
    const { data: selfReported, error: selfReportedError } = await supabase
      .from("self_reported_hours")
      .select("hours, validation_status, volunteer_id");

    if (selfReportedError) {
      Logger.warn("Error fetching global self-reported hours", {
        error: selfReportedError,
      });
    }

    // Get skill endorsements count
    const { count: endorsementsCount, error: endorsementsError } =
      await supabase
        .from("skill_endorsements")
        .select("id", { count: "exact", head: true });

    if (endorsementsError) {
      Logger.warn("Error fetching global skill endorsements", {
        error: endorsementsError,
      });
    }

    // Calculate stats
    const cryptoDonationAmount =
      donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const fiatDonationAmount =
      fiatDonations?.reduce((sum, d) => sum + (d.amount_cents || 0), 0) / 100 || 0;
    const totalDonationAmount = cryptoDonationAmount + fiatDonationAmount;

    const uniqueDonors = new Set([
      ...(donations?.map((d) => d.donor_id) || []),
      ...(fiatDonations?.map((d) => d.donor_id) || []),
    ]);

    const totalFormalHours =
      formalHours?.reduce((sum, h) => sum + (h.hours || 0), 0) || 0;

    let validatedSelfReported = 0;
    let pendingSelfReported = 0;
    let totalSelfReported = 0;

    selfReported?.forEach((h) => {
      const hours = h.hours || 0;
      totalSelfReported += hours;
      if (h.validation_status === "validated") {
        validatedSelfReported += hours;
      } else if (h.validation_status === "pending") {
        pendingSelfReported += hours;
      }
    });

    // Get unique volunteers from both sources
    const volunteerIds = new Set<string>();
    formalHours?.forEach((h) => {
      if (h.volunteer_id) volunteerIds.add(h.volunteer_id);
    });
    selfReported?.forEach((h) => {
      if (h.volunteer_id) volunteerIds.add(h.volunteer_id);
    });

    return {
      totalDonations: (donations?.length || 0) + (fiatDonations?.length || 0),
      totalDonationAmount,
      totalFormalVolunteerHours: totalFormalHours,
      totalSelfReportedHours: {
        validated: validatedSelfReported,
        pending: pendingSelfReported,
        total: totalSelfReported,
      },
      totalVolunteerHours: totalFormalHours + validatedSelfReported,
      totalVolunteers: volunteerIds.size,
      totalDonors: uniqueDonors.size,
      totalSkillsEndorsed: endorsementsCount || 0,
    };
  } catch (error) {
    Logger.error("Error fetching global contribution stats", { error });
    throw new Error("Failed to fetch global stats");
  }
}
