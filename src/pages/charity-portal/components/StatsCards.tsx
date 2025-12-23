import React from "react";
import { DollarSign, Users, Clock, Award, TrendingUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

interface CharityStats {
  totalDonated: number;
  volunteerHours: number;
  skillsEndorsed: number;
  activeVolunteers: number;
}

interface StatsCardsProps {
  stats: CharityStats;
  onTransactionsClick: () => void;
  onVolunteersClick: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  onTransactionsClick,
  onVolunteersClick,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 mb-8 grid-cols-2 lg:grid-cols-4">
      {/* Donations Card */}
      <button
        onClick={onTransactionsClick}
        className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group cursor-pointer"
      >
        <div className="flex items-center">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shadow-inner">
            <DollarSign className="h-7 w-7 text-indigo-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">
              {t("dashboard.totalDonations")}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              <CurrencyDisplay amount={stats.totalDonated} />
            </p>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {t("dashboard.thisMonth", "This month")}
            </p>
          </div>
        </div>
        <div className="h-1 w-full bg-indigo-500 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Volunteers Card */}
      <button
        onClick={onVolunteersClick}
        className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group cursor-pointer"
      >
        <div className="flex items-center">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-inner">
            <Users className="h-7 w-7 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">
              {t("charity.activeVolunteers")}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.activeVolunteers}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t("dashboard.verified", "Verified volunteers")}
            </p>
          </div>
        </div>
        <div className="h-1 w-full bg-green-500 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Hours Card */}
      <button
        onClick={onVolunteersClick}
        className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group cursor-pointer"
      >
        <div className="flex items-center">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-inner">
            <Clock className="h-7 w-7 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">
              {t("dashboard.volunteerHours")}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.volunteerHours}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t("dashboard.hoursLogged", "Hours logged")}
            </p>
          </div>
        </div>
        <div className="h-1 w-full bg-purple-500 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Skills Card */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
        <div className="flex items-center">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-inner">
            <Award className="h-7 w-7 text-amber-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">
              {t("dashboard.skillsEndorsed")}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.skillsEndorsed}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t("dashboard.endorsements", "Endorsements")}
            </p>
          </div>
        </div>
        <div className="h-1 w-full bg-amber-500 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default StatsCards;
