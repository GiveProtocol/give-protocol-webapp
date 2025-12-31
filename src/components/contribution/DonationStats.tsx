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

export const DonationStats: React.FC<DonationStatsProps> = ({
  stats,
  isPersonal,
}) => {
  const { t } = useTranslation();

  if (!stats) return null;

  const hoursInfo = getDisplayHours(stats.volunteerHours);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
        <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-400 p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {isPersonal
              ? t("dashboard.yourTotalDonated", "Your Total Donated")
              : t("dashboard.totalDonations")}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            <CurrencyDisplay amount={stats.totalDonated} />
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <Clock className="h-6 w-6 text-green-600 dark:text-green-400 p-3 rounded-full bg-green-100 dark:bg-green-900/30" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {isPersonal
                ? t("dashboard.yourVolunteerHours", "Your Volunteer Hours")
                : t("dashboard.volunteerHours")}
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {hoursInfo.total.toLocaleString()}
            </p>
          </div>
        </div>
        {hoursInfo.hasBreakdown && (
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
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
        <Award className="h-6 w-6 text-purple-600 dark:text-purple-400 p-3 rounded-full bg-purple-100 dark:bg-purple-900/30" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {isPersonal
              ? t("dashboard.yourSkillsEndorsed", "Your Skills Endorsed")
              : t("dashboard.skillsEndorsed")}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {stats.skillsEndorsed.toLocaleString()}
          </p>
        </div>
      </div>

      {stats.organizationsHelped !== undefined && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {isPersonal
              ? t("dashboard.yourOrganizationsHelped", "Organizations You've Helped")
              : t("dashboard.organizationsHelped", "Organizations Helped")}
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {stats.organizationsHelped.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
