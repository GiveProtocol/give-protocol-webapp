import React, { useState, useEffect, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import {
  DollarSign,
  Users,
  Clock,
  Download,
  Award,
  ExternalLink,
  Plus,
  CheckCircle,
  X,
  ChevronUp,
  ChevronDown,
  MapPin,
  Globe,
  Trash2,
  Edit,
  Target,
} from "lucide-react";
import {
  MAX_OPPORTUNITIES_PER_CHARITY,
  MAX_CAUSES_PER_CHARITY,
} from "@/types/charity";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Transaction } from "@/types/contribution";
import { DonationExportModal } from "@/components/contribution/DonationExportModal";
import { formatDate } from "@/utils/date";
import { useTranslation } from "@/hooks/useTranslation";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { supabase } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
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
    "transactions" | "volunteers" | "applications" | "opportunities" | "causes"
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

  // Individual sort handlers for better performance
  const handleSortByDate = useCallback(() => handleSort("date"), [handleSort]);
  const handleSortByType = useCallback(() => handleSort("type"), [handleSort]);
  const handleSortByOrganization = useCallback(
    () => handleSort("organization"),
    [handleSort],
  );
  const handleSortByStatus = useCallback(
    () => handleSort("status"),
    [handleSort],
  );

  // Modal close handler
  const handleCloseExportModal = useCallback(
    () => setShowExportModal(false),
    [],
  );

  const sortedTransactions = useCallback(() => {
    if (!sortConfig.key) return transactions;

    return [...transactions].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.key) {
        case "date":
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case "type":
          aValue = a.purpose.toLowerCase();
          bValue = b.purpose.toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case "organization":
          aValue = (
            a.metadata?.organization ||
            a.metadata?.donor ||
            "Anonymous"
          ).toLowerCase();
          bValue = (
            b.metadata?.organization ||
            b.metadata?.donor ||
            "Anonymous"
          ).toLowerCase();
          break;
        default:
          return 0;
      }

      // Use localeCompare for strings, numeric comparison for numbers
      if (typeof aValue === "string" && typeof bValue === "string") {
        const compareResult = aValue.localeCompare(bValue);
        return sortConfig.direction === "asc" ? compareResult : -compareResult;
      } else {
        // Numeric comparison for timestamps and other numbers
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      }
    });
  }, [transactions, sortConfig]);

  const getSortIcon = useCallback(
    (columnKey: "date" | "type" | "status" | "organization") => {
      if (sortConfig.key !== columnKey) {
        return <ChevronUp className="h-4 w-4 text-gray-300" />;
      }
      return sortConfig.direction === "asc" ? (
        <ChevronUp className="h-4 w-4 text-gray-600" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-600" />
      );
    },
    [sortConfig],
  );

  if (!user) {
    return <Navigate to="/login?type=charity" />;
  }

  if (profileLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("charity.dashboard")}
        </h1>
        <p className="mt-2 text-gray-600">{t("charity.subtitle")}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 mb-8 md:grid-cols-4">
        <Card className="p-6 flex items-center">
          <DollarSign className="h-12 w-12 p-3 rounded-full bg-indigo-100 text-indigo-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              {t("dashboard.totalDonations")}
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              <CurrencyDisplay amount={charityStats.totalDonated} />
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center">
          <Users className="h-12 w-12 p-3 rounded-full bg-green-100 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              {t("charity.activeVolunteers")}
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {charityStats.activeVolunteers}
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center">
          <Clock className="h-12 w-12 p-3 rounded-full bg-purple-100 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              {t("dashboard.volunteerHours")}
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {charityStats.volunteerHours}
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center">
          <Award className="h-12 w-12 p-3 rounded-full bg-amber-100 text-amber-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              {t("dashboard.skillsEndorsed")}
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {charityStats.skillsEndorsed}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={handleTransactionsTab}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "transactions"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("charity.transactions")}
            </button>
            <button
              onClick={handleVolunteersTab}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "volunteers"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("charity.volunteers")}
            </button>
            <button
              onClick={handleApplicationsTab}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "applications"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("charity.applications")}
            </button>
            <button
              onClick={handleOpportunitiesTab}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "opportunities"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("volunteer.opportunities")}
            </button>
            <button
              onClick={handleCausesTab}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "causes"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("cause.causes", "Causes")}
            </button>
          </nav>
        </div>
      </div>

      {/* Transaction History */}
      {activeTab === "transactions" && (
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("charity.transactions")}
            </h2>
            <Button
              onClick={handleShowExportModal}
              variant="secondary"
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("contributions.export")}
            </Button>
          </div>
          {transactions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none flex items-center space-x-1"
                    onClick={handleSortByDate}
                  >
                    {t("contributions.date")}
                    {getSortIcon("date")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none flex items-center space-x-1"
                    onClick={handleSortByType}
                  >
                    {t("contributions.type")}
                    {getSortIcon("type")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none flex items-center space-x-1"
                    onClick={handleSortByOrganization}
                  >
                    {t("donor.volunteer", "Donor/Volunteer")}
                    {getSortIcon("organization")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("contributions.details")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none flex items-center space-x-1"
                    onClick={handleSortByStatus}
                  >
                    {t("contributions.status")}
                    {getSortIcon("status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("contributions.verification")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTransactions().map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.timestamp, true)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t(
                        `contribution.type.${transaction.purpose.toLowerCase().replace(" ", "")}`,
                        transaction.purpose,
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.metadata?.organization ||
                        transaction.metadata?.donor ||
                        t("donor.anonymous", "Anonymous")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span>
                        {transaction.amount} {transaction.cryptoType} (
                        <CurrencyDisplay amount={transaction.fiatValue || 0} />)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {t(
                          `status.${transaction.status}`,
                          transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1),
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.hash ? (
                        <a
                          href={`https://moonscan.io/tx/${transaction.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <span className="truncate max-w-[100px]">
                            {transaction.hash.substring(0, 10)}...
                          </span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        t("common.notAvailable", "N/A")
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions found.
            </div>
          )}
        </div>
      )}

      {/* Volunteer Hours Verification */}
      {activeTab === "volunteers" && (
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("volunteer.pendingHours", "Pending Volunteer Hours")}
              </h2>
              <Button variant="secondary" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                {t("contributions.export")}
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {pendingHours.length > 0 ? (
              pendingHours.map((hours) => (
                <div
                  key={hours.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                >
                  <div className="flex-grow pr-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {hours.volunteerName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {hours.hours} {t("volunteer.hours")}{" "}
                      {formatDate(hours.date_performed)}
                    </p>
                    {hours.description && (
                      <>
                        <p className="text-sm text-gray-500 mb-1">
                          {t("volunteer.description")}
                        </p>
                        <p className="text-sm text-gray-700">
                          {hours.description}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t("volunteer.verify")}
                    </Button>
                    <Button variant="secondary" className="flex items-center">
                      <X className="h-4 w-4 mr-2" />
                      {t("volunteer.reject")}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t(
                  "volunteer.noPendingHours",
                  "No pending volunteer hours to verify.",
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Volunteer Applications */}
      {activeTab === "applications" && (
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("volunteer.pendingApplications", "Pending Applications")}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {pendingApplications.length > 0 ? (
              pendingApplications.map((application) => (
                <div
                  key={application.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                >
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium text-gray-900">
                      {application.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t("volunteer.appliedFor")}:{" "}
                      {application.opportunity?.title || "Unknown Opportunity"}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t("volunteer.accept")}
                    </Button>
                    <Button variant="secondary" className="flex items-center">
                      <X className="h-4 w-4 mr-2" />
                      {t("volunteer.reject")}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t(
                  "volunteer.noPendingApplications",
                  "No pending applications to review.",
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Volunteer Opportunities Management */}
      {activeTab === "opportunities" && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t("volunteer.opportunities", "Volunteer Opportunities")}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {opportunities.filter((o) => o.status === "active").length} of{" "}
                {MAX_OPPORTUNITIES_PER_CHARITY} active opportunities
              </p>
            </div>
            <Link to="/charity-portal/create-opportunity">
              <Button
                className="flex items-center"
                disabled={
                  opportunities.filter((o) => o.status === "active").length >=
                  MAX_OPPORTUNITIES_PER_CHARITY
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("volunteer.createNew", "Create New")}
              </Button>
            </Link>
          </div>

          {opportunities.length > 0 ? (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <Card
                  key={opportunity.id}
                  className="p-6 flex justify-between items-start"
                >
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 inline-flex items-center gap-2 mb-2">
                      {opportunity.title}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          opportunity.status === "active"
                            ? "bg-green-100 text-green-800"
                            : opportunity.status === "filled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {opportunity.status.charAt(0).toUpperCase() +
                          opportunity.status.slice(1)}
                      </span>
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {opportunity.description.replace(/[<>]/g, "")}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {opportunity.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {opportunity.commitment}
                      </span>
                      <span className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        {opportunity.type}
                      </span>
                    </div>
                    {opportunity.skills && opportunity.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {opportunity.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {opportunity.skills.length > 5 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{opportunity.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" className="p-2" title="Edit">
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" className="p-2" title="Delete">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8 text-gray-500">
                {t(
                  "volunteer.noOpportunitiesYet",
                  'No opportunities created yet. Click "Create New" to get started.',
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Causes Tab */}
      {activeTab === "causes" && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t("cause.causes", "Causes")}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {causes.filter((c) => c.status === "active").length} of{" "}
                {MAX_CAUSES_PER_CHARITY} active causes
              </p>
            </div>
            <Link to="/charity-portal/create-cause">
              <Button
                className="flex items-center"
                disabled={
                  causes.filter((c) => c.status === "active").length >=
                  MAX_CAUSES_PER_CHARITY
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("cause.createNew", "Create New")}
              </Button>
            </Link>
          </div>

          {causes.length > 0 ? (
            <div className="space-y-4">
              {causes.map((cause) => (
                <Card key={cause.id} className="p-6">
                  <header className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {cause.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        cause.status === "active"
                          ? "bg-green-100 text-green-800"
                          : cause.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {cause.status.charAt(0).toUpperCase() +
                        cause.status.slice(1)}
                    </span>
                    <span className="ml-auto flex gap-2">
                      <Button variant="ghost" className="p-2" title="Edit">
                        <Edit className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" className="p-2" title="Delete">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </span>
                  </header>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {cause.description}
                  </p>
                  <p className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {cause.location}
                    </span>
                    <span className="flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      {cause.category}
                    </span>
                    {cause.timeline && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {cause.timeline}
                      </span>
                    )}
                  </p>
                  <p className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Funding Progress</span>
                    <span className="font-medium">
                      <CurrencyDisplay amount={cause.raised_amount} /> /{" "}
                      <CurrencyDisplay amount={cause.target_amount} />
                    </span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((cause.raised_amount / cause.target_amount) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8 text-gray-500">
                {t(
                  "cause.noCausesYet",
                  'No causes created yet. Click "Create New" to get started.',
                )}
              </div>
            </div>
          )}
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
  );
};

export default CharityPortal;
