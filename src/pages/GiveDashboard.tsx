import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWeb3 } from "@/contexts/Web3Context";
import {
  DollarSign,
  Clock,
  Award,
  Download,
  Calendar,
  ExternalLink,
  Settings,
  ChevronUp,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Transaction } from "@/types/contribution";
import { DonationExportModal } from "@/components/contribution/DonationExportModal";
import { formatDate } from "@/utils/date";
import { useTranslation } from "@/hooks/useTranslation";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { WalletAliasSettings } from "@/components/settings/WalletAliasSettings";
import { ScheduledDonations } from "@/components/donor/ScheduledDonations";
import { SelfReportedHoursDashboard } from "@/components/volunteer/self-reported";
import {
  useUserContributionStats,
  useUnifiedContributions,
} from "@/hooks/useContributionStats";
import type { UnifiedContribution } from "@/services/contributionAggregationService";
import { useProfile } from "@/hooks/useProfile";

type View =
  | "select"
  | "donor"
  | "charity"
  | "forgotPassword"
  | "forgotUsername";

type SortKey = "date" | "type" | "status" | "organization";

/**
 * Extracts sortable value from a contribution based on sort key
 */
function getSortValue(
  contribution: Transaction,
  key: SortKey,
): string | number {
  switch (key) {
    case "date":
      return new Date(contribution.timestamp).getTime();
    case "type":
      return contribution.purpose.toLowerCase();
    case "status":
      return contribution.status.toLowerCase();
    case "organization":
      return (contribution.metadata?.organization || "").toLowerCase();
    default:
      // All SortKey cases are handled above; this satisfies exhaustiveness checking
      return "";
  }
}

/**
 * Compares two values for sorting
 */
function compareValues(
  aValue: string | number,
  bValue: string | number,
  direction: "asc" | "desc",
): number {
  if (typeof aValue === "string" && typeof bValue === "string") {
    const result = aValue.localeCompare(bValue);
    return direction === "asc" ? result : -result;
  }
  if (aValue < bValue) return direction === "asc" ? -1 : 1;
  if (aValue > bValue) return direction === "asc" ? 1 : -1;
  return 0;
}

/**
 * Maps a UnifiedContribution to the Transaction shape used by the table and export modal
 */
function mapContributionToTransaction(c: UnifiedContribution): Transaction {
  if (c.isFiatDonation) {
    return {
      id: c.id,
      amount: c.amount || 0,
      cryptoType: "USD",
      fiatValue: c.amount || 0,
      timestamp: c.date,
      status: c.status === "completed" ? "completed" : "pending",
      purpose: "Fiat Donation",
      metadata: {
        organization: c.organizationName,
        category: "Fiat Donation",
        isFiatDonation: true,
        paymentMethod: c.paymentMethod,
        disbursementStatus: c.disbursementStatus,
      },
    };
  }

  if (c.type === "donation") {
    return {
      id: c.id,
      amount: c.amount || 0,
      cryptoType: "GLMR",
      fiatValue: c.amount || 0,
      timestamp: c.date,
      status: c.status === "completed" ? "completed" : "pending",
      purpose: "Donation",
      metadata: {
        organization: c.organizationName,
        category: "Donation",
      },
    };
  }

  // Volunteer contributions
  const purposeMap: Record<string, string> = {
    formal_volunteer: "Volunteer Hours",
    self_reported: "Volunteer Hours",
  };

  return {
    id: c.id,
    amount: 0,
    timestamp: c.date,
    status: c.status === "completed" || c.status === "validated" ? "completed" : "pending",
    purpose: purposeMap[c.type] || c.type,
    metadata: {
      organization: c.organizationName,
      hours: c.hours,
      description: c.description,
    },
  };
}

export const GiveDashboard: React.FC = () => {
  const [_view, _setView] = useState<View>("select"); // Prefixed as unused
  const { user, userType } = useAuth();
  const { isConnected, connect } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showWalletSettings, setShowWalletSettings] = useState(false);
  const [showScheduledDonations, setShowScheduledDonations] = useState(false);
  const [showVolunteerHours, setShowVolunteerHours] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: "date" | "type" | "status" | "organization" | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const { t } = useTranslation();

  // Real data hooks
  const { profile } = useProfile();
  const { data: stats, isLoading: statsLoading } =
    useUserContributionStats();
  const { data: rawContributions = [], isLoading: contribLoading } =
    useUnifiedContributions({
      userId: profile?.id,
    });

  const contributions = useMemo(
    () => rawContributions.map(mapContributionToTransaction),
    [rawContributions],
  );

  // Check if we should show wallet settings from location state
  useEffect(() => {
    if (location.state?.showWalletSettings) {
      setShowWalletSettings(true);
    }
  }, [location.state]);

  // Wrapper to prevent click event from being passed to connect
  const handleConnectWallet = useCallback(() => {
    connect();
  }, [connect]);

  /**
   * Determines if a navigation path is currently active and returns appropriate CSS classes
   * @param _path - The path to check against current location (unused parameter)
   * @returns CSS classes for active or inactive navigation state
   */
  const _isActive = (
    _path: string, // Prefixed as unused
  ) =>
    location.pathname === _path
      ? "bg-primary-100 text-primary-900"
      : "text-gray-700 hover:bg-primary-50";

  const handleSkillClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const skill = e.currentTarget.dataset.skill;
      if (!skill) return;
      navigate("/contributions", {
        state: {
          activeTab: "volunteer",
          section: "endorsements",
          skill,
        },
      });
    },
    [navigate],
  );

  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedYear(e.target.value);
    },
    [],
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedType(e.target.value);
    },
    [],
  );

  const handleShowExportModal = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const toggleScheduledDonations = useCallback(() => {
    setShowScheduledDonations(!showScheduledDonations);
  }, [showScheduledDonations]);

  const toggleWalletSettings = useCallback(() => {
    setShowWalletSettings(!showWalletSettings);
  }, [showWalletSettings]);

  const toggleVolunteerHours = useCallback(() => {
    setShowVolunteerHours(!showVolunteerHours);
  }, [showVolunteerHours]);

  const handleAdminRedirect = useCallback(() => {
    window.location.href = `${window.location.origin}/admin`;
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

  const handleSortByDate = useCallback(() => {
    handleSort("date");
  }, [handleSort]);

  const handleSortByType = useCallback(() => {
    handleSort("type");
  }, [handleSort]);

  const handleSortByOrganization = useCallback(() => {
    handleSort("organization");
  }, [handleSort]);

  const handleSortByStatus = useCallback(() => {
    handleSort("status");
  }, [handleSort]);

  const handleCloseExportModal = useCallback(() => {
    setShowExportModal(false);
  }, []);

  const getSortIcon = useCallback(
    (key: "date" | "type" | "status" | "organization") => {
      if (sortConfig.key !== key) {
        return <ChevronUp className="h-4 w-4 text-gray-400" />;
      }
      return sortConfig.direction === "asc" ? (
        <ChevronUp className="h-4 w-4 text-gray-600" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-600" />
      );
    },
    [sortConfig],
  );

  const filteredContributions = contributions
    .filter((contribution) => {
      const contributionDate = new Date(contribution.timestamp);
      const matchesYear =
        selectedYear === "all" ||
        contributionDate.getFullYear().toString() === selectedYear;
      const matchesType =
        selectedType === "all" || contribution.purpose === selectedType;
      return matchesYear && matchesType;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);
      return compareValues(aValue, bValue, sortConfig.direction);
    });

  const years = [
    "all",
    ...new Set(
      contributions.map((c) => new Date(c.timestamp).getFullYear().toString()),
    ),
  ].sort((a, b) => b.localeCompare(a));

  // Allow access if user is authenticated OR wallet is connected
  if (!user && !isConnected) {
    return <Navigate to="/login?type=donor" />;
  }

  // Redirect charity users to charity portal
  if (userType === "charity") {
    return <Navigate to="/charity-portal" />;
  }

  // Show blank page for admin users - they should use /admin instead
  if (userType === "admin") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Please use the admin panel to manage the platform.
          </p>
          <Button onClick={handleAdminRedirect}>Go to Admin Panel</Button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-6">
            To view your dashboard and make donations, please connect your
            wallet.
          </p>
          <Button onClick={handleConnectWallet}>Connect Wallet</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("dashboard.title")}
          </h1>
          <p className="mt-2 text-gray-600">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex space-x-3 flex-shrink-0">
          <Button
            variant="secondary"
            onClick={toggleVolunteerHours}
            className="flex items-center"
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            {showVolunteerHours ? "Hide" : "Log"} Volunteer Hours
          </Button>
          <Button
            variant="secondary"
            onClick={toggleScheduledDonations}
            className="flex items-center"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {showScheduledDonations ? "Hide" : "View"} Monthly Donations
          </Button>
          <Button
            variant="secondary"
            onClick={toggleWalletSettings}
            className="flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Wallet Settings
          </Button>
        </div>
      </div>

      {showWalletSettings && (
        <div className="mb-8">
          <WalletAliasSettings />
        </div>
      )}

      {showScheduledDonations && (
        <div className="mb-8">
          <ScheduledDonations />
        </div>
      )}

      {showVolunteerHours && (
        <div className="mb-8">
          <SelfReportedHoursDashboard onToggle={toggleVolunteerHours} />
        </div>
      )}

      {/* Metrics Grid - Flattened from 4 to 3 levels */}
      {statsLoading || contribLoading ? (
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 flex items-center animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-full mr-4" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-7 bg-gray-200 rounded w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card className="p-6 flex items-center">
            <DollarSign className="h-6 w-6 p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.totalDonations")}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                <CurrencyDisplay
                  amount={
                    (stats?.totalDonated || 0) + (stats?.totalFiatDonated || 0)
                  }
                />
              </p>
            </div>
          </Card>

          <Card className="p-6 flex items-center">
            <Clock className="h-6 w-6 p-3 rounded-full bg-green-100 text-green-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.volunteerHours")}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalVolunteerHours || 0}
              </p>
            </div>
          </Card>

          <Card className="p-6 flex items-center">
            <Award className="h-6 w-6 p-3 rounded-full bg-purple-100 text-purple-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("dashboard.skillsEndorsed")}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.skillsEndorsed || 0}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Contributions - Flattened to reduce nesting */}
      <div className="bg-white rounded-lg shadow-md mb-8 overflow-x-auto">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("dashboard.contributions")}
          </h2>
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              aria-label="Filter by year"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year === "all" ? t("filter.allYears", "All Years") : year}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              aria-label="Filter by type"
            >
              <option value="all">{t("filter.allTypes", "All Types")}</option>
              <option value="Donation">
                {t("filter.donations", "Donations")}
              </option>
              <option value="Fiat Donation">
                {t("filter.fiatDonations", "Fiat Donations")}
              </option>
              <option value="Volunteer Application">
                {t("filter.volunteerApplications", "Volunteer Applications")}
              </option>
              <option value="Volunteer Hours">
                {t("filter.volunteerHours", "Volunteer Hours")}
              </option>
            </select>
            <Button
              onClick={handleShowExportModal}
              variant="secondary"
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("contributions.export")}
            </Button>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none"
                onClick={handleSortByDate}
              >
                <div className="flex items-center space-x-1">
                  <span>{t("contributions.date")}</span>
                  {getSortIcon("date")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none"
                onClick={handleSortByType}
              >
                <div className="flex items-center space-x-1">
                  <span>{t("contributions.type")}</span>
                  {getSortIcon("type")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none"
                onClick={handleSortByOrganization}
              >
                <div className="flex items-center space-x-1">
                  <span>{t("contributions.organization")}</span>
                  {getSortIcon("organization")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("contributions.details")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none"
                onClick={handleSortByStatus}
              >
                <div className="flex items-center space-x-1">
                  <span>{t("contributions.status")}</span>
                  {getSortIcon("status")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("contributions.verification")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredContributions.map((contribution) => (
              <tr key={contribution.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(contribution.timestamp, true)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {t(
                    `contribution.type.${contribution.purpose.toLowerCase().replace(" ", "")}`,
                    contribution.purpose,
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contribution.metadata?.organization ||
                    t("common.unknown", "Unknown")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contribution.purpose === "Fiat Donation" ? (
                    <>
                      <CurrencyDisplay amount={contribution.amount || 0} />
                      {contribution.metadata?.disbursementStatus && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({contribution.metadata.disbursementStatus})
                        </span>
                      )}
                    </>
                  ) : contribution.purpose === "Donation" ? (
                    <>
                      {contribution.amount} {contribution.cryptoType} (
                      <CurrencyDisplay amount={contribution.fiatValue || 0} />)
                    </>
                  ) : contribution.purpose === "Volunteer Hours" ? (
                    <>
                      {contribution.metadata?.hours} {t("volunteer.hours")} -{" "}
                      {contribution.metadata?.description}
                    </>
                  ) : (
                    contribution.metadata?.opportunity
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contribution.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : contribution.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t(
                      `status.${contribution.status}`,
                      contribution.status.charAt(0).toUpperCase() +
                        contribution.status.slice(1),
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contribution.hash ||
                  contribution.metadata?.verificationHash ? (
                    <a
                      href={`https://moonscan.io/tx/${contribution.hash || contribution.metadata?.verificationHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 flex items-center truncate max-w-[100px] mr-1"
                      title={
                        contribution.hash ||
                        contribution.metadata?.verificationHash
                      }
                    >
                      {(
                        contribution.hash ||
                        contribution.metadata?.verificationHash ||
                        ""
                      ).substring(0, 10)}
                      ...
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    t("common.notAvailable", "N/A")
                  )}
                  {contribution.metadata?.blockNumber && (
                    <div className="text-xs text-gray-500 mt-1">
                      {t("blockchain.block", "Block")} #
                      {contribution.metadata.blockNumber}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Skills & Endorsements - Flattened from 4 to 3 levels */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("skills.endorsements", "Skills & Endorsements")}
          </h2>
        </div>
        <div className="p-6 grid gap-4 md:grid-cols-2">
          {[
            { skill: "Web Development", endorsements: 5 },
            { skill: "Project Management", endorsements: 3 },
            { skill: "Event Planning", endorsements: 4 },
          ].map((item) => (
            <button
              key={item.skill}
              data-skill={item.skill}
              onClick={handleSkillClick}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-900">{item.skill}</h3>
                <p className="text-sm text-gray-500">
                  {item.endorsements} {t("skills.endorsements", "endorsements")}
                </p>
              </div>
              <Award className="h-5 w-5 text-indigo-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <DonationExportModal
          donations={contributions}
          onClose={handleCloseExportModal}
        />
      )}
    </div>
  );
};

export default GiveDashboard;
