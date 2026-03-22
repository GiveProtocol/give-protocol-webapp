import React from "react";
import { DollarSign, Clock, Award, Users } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { useTranslation } from "@/hooks/useTranslation";
import type { VolunteerHoursBreakdown } from "@/types/contribution";

interface DonationStatsProps {
  stats?: {
    totalDonated: number;
    volunteerHours: number | VolunteerHoursBreakdown;
    skillsEndorsed: number;
    organizationsHelped?: number;
  };
  isPersonal?: boolean;
}

/**
 * Helper to get display hours from the volunteerHours prop
 */
function getDisplayHours(volunteerHours: number | VolunteerHoursBreakdown): {
  total: number;
  hasBreakdown: boolean;
  formal?: number;
  selfReported?: { validated: number; pending: number };
} {
  if (typeof volunteerHours === "number") {
    return { total: volunteerHours, hasBreakdown: false };
  }
  return {
    total: volunteerHours.total,
    hasBreakdown: true,
    formal: volunteerHours.formal,
    selfReported: {
      validated: volunteerHours.selfReported.validated,
      pending: volunteerHours.selfReported.pending,
    },
  };
}

/** Stat card with icon, label, and value, plus optional extra content below. */
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  children?: React.ReactNode;
}> = ({ icon, label, value, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <div className="flex items-center">
      {icon}
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
    {children}
  </div>
);

/** Breakdown of volunteer hours by type (verified, self-reported, pending). */
const HoursBreakdown: React.FC<{ hoursInfo: ReturnType<typeof getDisplayHours> }> = ({ hoursInfo }) => (
  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 space-y-1">
    <div className="flex justify-between">
      <span>Verified Hours:</span>
      <span className="font-medium">
        {hoursInfo.formal?.toLocaleString() || 0}
      </span>
    </div>
    <div className="flex justify-between">
      <span>Self-Reported (Validated):</span>
      <span className="font-medium text-green-600 dark:text-green-400">
        {hoursInfo.selfReported?.validated.toLocaleString() || 0}
      </span>
    </div>
    {(hoursInfo.selfReported?.pending || 0) > 0 && (
      <div className="flex justify-between">
        <span>Pending Validation:</span>
        <span className="font-medium text-amber-600 dark:text-amber-400">
          {hoursInfo.selfReported?.pending.toLocaleString() || 0}
        </span>
      </div>
    )}
  </div>
);

/**
 * DonationStats component displays donation and volunteer hour statistics.
 *
 * @param stats - Donation statistics including total amount donated and volunteer hours.
 * @param isPersonal - Flag indicating whether to display personal statistics.
 * @returns The rendered statistics component or null if no stats are provided.
 */
export const DonationStats: React.FC<DonationStatsProps> = ({
  stats,
  isPersonal,
}) => {
  const { t } = useTranslation();

  if (!stats) return null;

  const hoursInfo = getDisplayHours(stats.volunteerHours);

  return (
    <>
      <StatCard
        icon={<DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400 p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30" />}
        label={isPersonal ? t("dashboard.yourTotalDonated", "Your Total Donated") : t("dashboard.totalDonations")}
        value={<CurrencyDisplay amount={stats.totalDonated} />}
      />

      <StatCard
        icon={<Clock className="h-6 w-6 text-green-600 dark:text-green-400 p-3 rounded-full bg-green-100 dark:bg-green-900/30" />}
        label={isPersonal ? t("dashboard.yourVolunteerHours", "Your Volunteer Hours") : t("dashboard.volunteerHours")}
        value={hoursInfo.total.toLocaleString()}
      >
        {hoursInfo.hasBreakdown && <HoursBreakdown hoursInfo={hoursInfo} />}
      </StatCard>

      <StatCard
        icon={<Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400 p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30" />}
        label={isPersonal ? t("dashboard.yourSkillsEndorsed", "Your Skills Endorsed") : t("dashboard.skillsEndorsed")}
        value={stats.skillsEndorsed.toLocaleString()}
      />

      {stats.organizationsHelped !== undefined && (
        <StatCard
          icon={<Users className="h-6 w-6 text-blue-600 dark:text-blue-400 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30" />}
          label={isPersonal ? t("dashboard.yourOrganizationsHelped", "Organizations You've Helped") : t("dashboard.organizationsHelped", "Organizations Helped")}
          value={stats.organizationsHelped.toLocaleString()}
        />
      )}
    </>
  );
};
