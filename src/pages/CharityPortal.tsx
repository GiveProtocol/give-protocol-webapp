import React, { useState, useEffect, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import {
  Plus,
  CheckCircle,
  Receipt,
  ClipboardList,
  Briefcase,
  Heart,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  ApplicationsTab,
  CausesTab,
  OpportunitiesTab,
  StatsCards,
  TransactionsTab,
  VolunteersTab,
} from "./charity-portal/components";
import { ValidationQueueDashboard } from "@/components/charity/validation";
import { Button } from "@/components/ui/Button";
import { Transaction } from "@/types/contribution";
import { DonationExportModal } from "@/components/contribution/DonationExportModal";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase";
import { Logger } from "@/utils/logger";

// Type definitions for Supabase data structures
interface DonationData {
  id?: string;
  amount?: string | number;
  created_at?: string;
  donor_id?: string;
  donor?: {
    id: string;
    user_id?: string;
  };
}

interface HourData {
  id?: string;
  hours?: string | number;
  volunteer_id?: string;
  date_performed?: string;
  description?: string;
  volunteer?: {
    id: string;
    user_id?: string;
  };
}

interface EndorsementData {
  id: string;
}

interface VolunteerData {
  volunteer_id: string;
}

interface BasicStatsData {
  donations: DonationData[];
  hours: HourData[];
  endorsements: EndorsementData[];
  volunteers: VolunteerData[];
}

interface VolunteerApplication {
  id: string;
  full_name: string;
  opportunity?: {
    id: string;
    title: string;
  };
}

interface VolunteerHours {
  id: string;
  volunteer_id: string;
  volunteerName: string;
  hours: number;
  date_performed: string;
  description: string;
}

interface CharityOpportunity {
  id: string;
  title: string;
  description: string;
  skills: string[];
  commitment: string;
  location: string;
  type: string;
  work_language: string;
  status: string;
  created_at: string;
}

interface CharityCause {
  id: string;
  name: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  category: string;
  image_url: string | null;
  location: string;
  timeline: string | null;
  status: string;
  created_at: string;
}

export const CharityPortal: React.FC = () => {
  const { user, userType } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState<
    | "transactions"
    | "volunteers"
    | "applications"
    | "opportunities"
    | "causes"
    | "validation"
  >("transactions");
  const [showExportModal, setShowExportModal] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: "date" | "type" | "status" | "organization" | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const { t } = useTranslation();

  // State for charity statistics
  const [charityStats, setCharityStats] = useState({
    totalDonated: 0,
    volunteerHours: 0,
    skillsEndorsed: 0,
    activeVolunteers: 0,
  });

  // State for transactions, applications, hours, and opportunities
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingApplications, setPendingApplications] = useState<
    VolunteerApplication[]
  >([]);
  const [pendingHours, setPendingHours] = useState<VolunteerHours[]>([]);
  const [opportunities, setOpportunities] = useState<CharityOpportunity[]>([]);
  const [causes, setCauses] = useState<CharityCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to fetch basic statistics data
  const fetchBasicStats = useCallback(
    async (charityId: string): Promise<BasicStatsData> => {
      try {
        // Fetch donations first (most critical)
        const donationsResult = await supabase
          .from("donations")
          .select("amount")
          .eq("charity_id", charityId);

        if (donationsResult.error) {
          Logger.error("Error fetching donations:", {
            error: donationsResult.error,
            charityId,
          });
          throw donationsResult.error;
        }

        // Fetch volunteer hours with better error handling
        let hoursResult = { data: [], error: null };
        let volunteersResult = { data: [], error: null };

        try {
          hoursResult = await supabase
            .from("volunteer_hours")
            .select("hours")
            .eq("charity_id", charityId)
            .eq("status", "approved");

          if (hoursResult.error) {
            Logger.warn("Error fetching volunteer hours:", {
              error: hoursResult.error,
              charityId,
              errorCode: hoursResult.error.code,
              errorMessage: hoursResult.error.message,
            });
            hoursResult = { data: [], error: null }; // Use empty data instead of failing
          }
        } catch (err) {
          Logger.warn("Exception fetching volunteer hours:", {
            error: err,
            charityId,
          });
          hoursResult = { data: [], error: null };
        }

        try {
          volunteersResult = await supabase
            .from("volunteer_hours")
            .select("volunteer_id")
            .eq("charity_id", charityId)
            .eq("status", "approved");

          if (volunteersResult.error) {
            Logger.warn("Error fetching volunteers list:", {
              error: volunteersResult.error,
              charityId,
              errorCode: volunteersResult.error.code,
              errorMessage: volunteersResult.error.message,
            });
            volunteersResult = { data: [], error: null }; // Use empty data instead of failing
          }
        } catch (err) {
          Logger.warn("Exception fetching volunteers list:", {
            error: err,
            charityId,
          });
          volunteersResult = { data: [], error: null };
        }

        // Fetch skill endorsements with error handling
        let endorsementsResult = { data: [], error: null };
        try {
          endorsementsResult = await supabase
            .from("skill_endorsements")
            .select("id")
            .eq("recipient_id", charityId);

          if (endorsementsResult.error) {
            Logger.warn("Error fetching skill endorsements:", {
              error: endorsementsResult.error,
              charityId,
            });
            endorsementsResult = { data: [], error: null }; // Use empty data instead of failing
          }
        } catch (err) {
          Logger.warn("Exception fetching skill endorsements:", {
            error: err,
            charityId,
          });
          endorsementsResult = { data: [], error: null };
        }

        return {
          donations: Array.isArray(donationsResult.data)
            ? donationsResult.data
            : [],
          hours: Array.isArray(hoursResult.data) ? hoursResult.data : [],
          endorsements: Array.isArray(endorsementsResult.data)
            ? endorsementsResult.data
            : [],
          volunteers: Array.isArray(volunteersResult.data)
            ? volunteersResult.data
            : [],
        };
      } catch (err) {
        Logger.error("Critical error in fetchBasicStats:", {
          error: err,
          charityId,
        });
        throw err;
      }
    },
    [],
  );

  // Helper function to calculate statistics
  const calculateStats = useCallback((data: BasicStatsData) => {
    const totalDonated = data.donations.reduce((sum, donation) => {
      const amount = donation?.amount ? Number(donation.amount) : 0;
      return sum + amount;
    }, 0);

    const totalHours = data.hours.reduce((sum, hour) => {
      const hourCount = hour?.hours ? Number(hour.hours) : 0;
      return sum + hourCount;
    }, 0);

    const uniqueVolunteers = new Set(
      data.volunteers.filter((v) => v?.volunteer_id).map((v) => v.volunteer_id),
    );

    return {
      totalDonated,
      volunteerHours: totalHours,
      skillsEndorsed: data.endorsements.length,
      activeVolunteers: uniqueVolunteers.size,
    };
  }, []);

  // Helper function to fetch and format detailed transactions
  const fetchTransactions = useCallback(async (charityId: string) => {
    const { data: detailedDonations, error } = await supabase
      .from("donations")
      .select(
        `
        id,
        amount,
        created_at,
        donor:donor_id (
          id,
          user_id
        )
      `,
      )
      .eq("charity_id", charityId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const donationsList = Array.isArray(detailedDonations)
      ? detailedDonations
      : [];

    return donationsList.map((donation) => ({
      id: donation?.id || "",
      hash: donation?.id || "",
      from: donation?.donor?.id || "",
      to: charityId,
      amount: donation?.amount ? Number(donation.amount) : 0,
      cryptoType: "GLMR",
      fiatValue: donation?.amount ? Number(donation.amount) : 0,
      fee: donation?.amount ? Number(donation.amount) * 0.001 : 0,
      timestamp: donation?.created_at || new Date().toISOString(),
      status: "completed",
      purpose: "Donation",
      metadata: {
        organization: donation?.donor?.id
          ? `Donor (${donation.donor.id.substring(0, 8)}...)`
          : "Anonymous",
        donor: donation?.donor?.id
          ? `Donor (${donation.donor.id.substring(0, 8)}...)`
          : "Anonymous",
        category: "Donation",
      },
    }));
  }, []);

  // Helper function to fetch volunteer applications
  const fetchVolunteerApplications = useCallback(async (charityId: string) => {
    const { data: opportunityIds, error: idsError } = await supabase
      .from("volunteer_opportunities")
      .select("id")
      .eq("charity_id", charityId);

    if (idsError) throw idsError;

    const validOpportunityIds =
      Array.isArray(opportunityIds) && opportunityIds.length > 0
        ? opportunityIds.map((opp) => opp.id).filter(Boolean)
        : [];

    if (validOpportunityIds.length === 0) {
      return [];
    }

    const { data: applications, error: applicationsError } = await supabase
      .from("volunteer_applications")
      .select(
        `
        id,
        full_name,
        opportunity:opportunity_id (
          id,
          title
        )
      `,
      )
      .eq("status", "pending")
      .in("opportunity_id", validOpportunityIds)
      .order("created_at", { ascending: false });

    if (applicationsError) throw applicationsError;

    return Array.isArray(applications) ? applications : [];
  }, []);

  // Helper function to fetch and format pending volunteer hours
  const fetchPendingHours = useCallback(async (charityId: string) => {
    try {
      const { data: pendingHoursData, error } = await supabase
        .from("volunteer_hours")
        .select(
          `
          id,
          volunteer_id,
          hours,
          date_performed,
          description,
          volunteer:volunteer_id (
            id,
            user_id
          )
        `,
        )
        .eq("charity_id", charityId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        Logger.warn("Error fetching pending volunteer hours:", {
          error,
          charityId,
          errorCode: error.code,
          errorMessage: error.message,
        });
        return []; // Return empty array instead of throwing
      }

      const pendingHoursList = Array.isArray(pendingHoursData)
        ? pendingHoursData
        : [];

      return pendingHoursList.map((hour) => ({
        id: hour?.id || "",
        volunteer_id: hour?.volunteer_id || "",
        volunteerName: hour?.volunteer?.id ? "Volunteer" : "Unknown Volunteer",
        hours: hour?.hours ? Number(hour.hours) : 0,
        date_performed: hour?.date_performed || new Date().toISOString(),
        description: hour?.description || "",
      }));
    } catch (err) {
      Logger.warn("Exception fetching pending volunteer hours:", {
        error: err,
        charityId,
      });
      return []; // Return empty array instead of throwing
    }
  }, []);

  // Helper function to fetch volunteer opportunities
  const fetchOpportunities = useCallback(async (charityId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("volunteer_opportunities")
        .select("*")
        .eq("charity_id", charityId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        Logger.warn("Error fetching opportunities:", { error: fetchError });
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (err) {
      Logger.warn("Exception fetching opportunities:", { error: err });
      return [];
    }
  }, []);

  // Helper function to fetch causes
  const fetchCauses = useCallback(async (charityId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("causes")
        .select("*")
        .eq("charity_id", charityId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        Logger.warn("Error fetching causes:", { error: fetchError });
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (err) {
      Logger.warn("Exception fetching causes:", { error: err });
      return [];
    }
  }, []);

  const fetchCharityData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError(null);

      Logger.info("Fetching charity data", { profileId: profile.id });

      // Fetch basic statistics data
      const basicData = await fetchBasicStats(profile.id);
      const stats = calculateStats(basicData);
      setCharityStats(stats);

      // Fetch detailed data in parallel
      const [
        formattedTransactions,
        applicationsList,
        formattedHours,
        opportunitiesList,
        causesList,
      ] = await Promise.all([
        fetchTransactions(profile.id),
        fetchVolunteerApplications(profile.id),
        fetchPendingHours(profile.id),
        fetchOpportunities(profile.id),
        fetchCauses(profile.id),
      ]);

      setTransactions(formattedTransactions);
      setPendingApplications(applicationsList);
      setPendingHours(formattedHours);
      setOpportunities(opportunitiesList);
      setCauses(causesList);

      Logger.info("Successfully fetched all charity data");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : "";

      Logger.error("Error fetching charity data:", {
        error: errorMessage,
        stack: errorStack,
        state: { profileId: profile?.id },
      });

      setError("Failed to load charity data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    profile?.id,
    fetchBasicStats,
    calculateStats,
    fetchTransactions,
    fetchVolunteerApplications,
    fetchPendingHours,
    fetchOpportunities,
    fetchCauses,
  ]);

  useEffect(() => {
    if (profile?.id) {
      fetchCharityData();
    }
  }, [profile?.id, fetchCharityData]);

  const handleRetry = useCallback(() => {
    setError(null);
    fetchCharityData();
  }, [fetchCharityData]);

  const handleRefresh = useCallback(() => {
    fetchCharityData();
  }, [fetchCharityData]);

  // Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!loading && !error) {
      setLastUpdated(new Date());
    }
  }, [loading, error]);

  const handleTransactionsTab = useCallback(() => {
    setActiveTab("transactions");
  }, []);

  const handleVolunteersTab = useCallback(() => {
    setActiveTab("volunteers");
  }, []);

  const handleApplicationsTab = useCallback(() => {
    setActiveTab("applications");
  }, []);

  const handleOpportunitiesTab = useCallback(() => {
    setActiveTab("opportunities");
  }, []);

  const handleCausesTab = useCallback(() => {
    setActiveTab("causes");
  }, []);

  const handleValidationTab = useCallback(() => {
    setActiveTab("validation");
  }, []);

  const handleShowExportModal = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleSort = useCallback(
    (key: "date" | "type" | "status" | "organization") => {
      setSortConfig((prevConfig) => ({
        key,
        direction:
          prevConfig.key === key && prevConfig.direction === "asc"
            ? "desc"
            : "asc",
      }));
    },
    [],
  );

  // Modal close handler
  const handleCloseExportModal = useCallback(
    () => setShowExportModal(false),
    [],
  );

  if (!user) {
    return <Navigate to="/login?type=charity" />;
  }

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeleton Header */}
          <div className="mb-8 animate-pulse">
            <div className="h-9 bg-gray-200 rounded w-64 mb-2" />
            <div className="h-5 bg-gray-200 rounded w-80" />
          </div>
          {/* Skeleton Stats */}
          <div className="grid gap-6 mb-8 grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-md animate-pulse"
              >
                <div className="flex items-center">
                  <div className="h-14 w-14 bg-gray-200 rounded-full" />
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                    <div className="h-8 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Skeleton Tabs */}
          <div className="bg-gray-100 rounded-xl p-1 mb-6 animate-pulse">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg flex-1" />
              ))}
            </div>
          </div>
          {/* Skeleton Content */}
          <div className="bg-white rounded-xl p-6 shadow-md animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          {error}
          <Button onClick={handleRetry} variant="secondary" className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Redirect donor users to donor portal
  if (userType !== "charity") {
    return <Navigate to="/donor-portal" />;
  }

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    return lastUpdated.toLocaleTimeString();
  };

  // Get pending counts for tab badges
  const pendingApplicationsCount = pendingApplications.length;
  const pendingHoursCount = pendingHours.length;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.display_name ||
                t("charity.dashboard", "Charity Dashboard")}
            </h1>
            <p className="mt-1 text-gray-600">
              {t("charity.subtitle", "Manage your charity dashboard")}
            </p>
          </div>
          <nav className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <Link to="/charity-portal/create-opportunity">
              <Button variant="secondary" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("volunteer.createOpportunity", "Create Opportunity")}
              </Button>
            </Link>
            <Link to="/charity-portal/create-cause">
              <Button variant="secondary" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                {t("cause.createCause", "Create Cause")}
              </Button>
            </Link>
          </nav>
        </header>

        {/* Stats Row with Last Updated */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("dashboard.overview", "Overview")}
          </h2>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {lastUpdated && (
              <span>
                {t("dashboard.lastUpdated", "Last updated")}:{" "}
                {formatLastUpdated()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={t("common.refresh", "Refresh")}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Enhanced Metrics Grid */}
        <StatsCards
          stats={charityStats}
          onTransactionsClick={handleTransactionsTab}
          onVolunteersClick={handleVolunteersTab}
        />

        {/* Enhanced Tabs with Icons */}
        <div className="mb-6">
          <div className="bg-gray-100 rounded-xl p-1.5 overflow-x-auto">
            <nav className="flex gap-1 min-w-max">
              <button
                onClick={handleTransactionsTab}
                className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === "transactions"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Receipt className="h-4 w-4" />
                {t("charity.transactions")}
              </button>
              <button
                onClick={handleVolunteersTab}
                className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 relative ${
                  activeTab === "volunteers"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Clock className="h-4 w-4" />
                {t("charity.volunteers")}
                {pendingHoursCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingHoursCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleApplicationsTab}
                className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 relative ${
                  activeTab === "applications"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                {t("charity.applications")}
                {pendingApplicationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingApplicationsCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleOpportunitiesTab}
                className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === "opportunities"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                {t("volunteer.opportunities")}
              </button>
              <button
                onClick={handleCausesTab}
                className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === "causes"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Heart className="h-4 w-4" />
                {t("cause.causes", "Causes")}
              </button>
              <button
                onClick={handleValidationTab}
                className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === "validation"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                Validation Queue
              </button>
            </nav>
          </div>
        </div>

        {/* Transaction History */}
        {activeTab === "transactions" && (
          <TransactionsTab
            transactions={transactions}
            sortConfig={sortConfig}
            onSort={handleSort}
            onShowExportModal={handleShowExportModal}
          />
        )}

        {/* Volunteer Hours Verification */}
        {activeTab === "volunteers" && (
          <VolunteersTab pendingHours={pendingHours} />
        )}

        {/* Volunteer Applications */}
        {activeTab === "applications" && (
          <ApplicationsTab pendingApplications={pendingApplications} />
        )}

        {/* Volunteer Opportunities Management */}
        {activeTab === "opportunities" && (
          <OpportunitiesTab opportunities={opportunities} />
        )}

        {/* Causes Tab */}
        {activeTab === "causes" && <CausesTab causes={causes} />}

        {/* Validation Queue */}
        {activeTab === "validation" && profile?.id && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8 p-6">
            <ValidationQueueDashboard organizationId={profile.id} />
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <DonationExportModal
            donations={transactions}
            onClose={handleCloseExportModal}
          />
        )}
      </div>
    </main>
  );
};

export default CharityPortal;
