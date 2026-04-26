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

const CARD_CLASS =
  "bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group cursor-pointer flex items-center";

const STATIC_CARD_CLASS =
  "bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex items-center";

const ICON_WRAPPER = "h-11 w-11 shrink-0 rounded-full flex items-center justify-center";
const LABEL_CLASS = "text-xs font-normal text-gray-500 tracking-wide";
const VALUE_CLASS = "text-2xl font-extrabold text-gray-900 leading-tight mt-0.5";
const SUB_CLASS = "text-[11px] text-gray-400 mt-1 flex items-center";

/** Grid of summary stat cards for donations, volunteers, hours, and endorsements. */
export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  onTransactionsClick,
  onVolunteersClick,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 mb-8 grid-cols-2 lg:grid-cols-4">
      {/* Donations Card */}
      <button onClick={onTransactionsClick} className={CARD_CLASS}>
        <span
          className={`${ICON_WRAPPER} bg-gradient-to-br from-emerald-100 to-emerald-200`}
        >
          <DollarSign className="h-5 w-5 text-emerald-600" />
        </span>
        <div className="ml-3">
          <p className={LABEL_CLASS}>{t("dashboard.totalDonations")}</p>
          <p className={VALUE_CLASS}>
            <CurrencyDisplay amount={stats.totalDonated} />
          </p>
          <p className={`${SUB_CLASS} text-emerald-600`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {t("dashboard.thisMonth", "This month")}
          </p>
        </div>
      </button>

      {/* Volunteers Card */}
      <button onClick={onVolunteersClick} className={CARD_CLASS}>
        <span
          className={`${ICON_WRAPPER} bg-gradient-to-br from-green-100 to-green-200`}
        >
          <Users className="h-5 w-5 text-green-600" />
        </span>
        <div className="ml-3">
          <p className={LABEL_CLASS}>{t("charity.activeVolunteers")}</p>
          <p className={VALUE_CLASS}>{stats.activeVolunteers}</p>
          <p className={SUB_CLASS}>
            {t("dashboard.verified", "Verified volunteers")}
          </p>
        </div>
      </button>

      {/* Hours Card */}
      <button onClick={onVolunteersClick} className={CARD_CLASS}>
        <span
          className={`${ICON_WRAPPER} bg-gradient-to-br from-emerald-100 to-emerald-200`}
        >
          <Clock className="h-5 w-5 text-emerald-600" />
        </span>
        <div className="ml-3">
          <p className={LABEL_CLASS}>{t("dashboard.volunteerHours")}</p>
          <p className={VALUE_CLASS}>{stats.volunteerHours}</p>
          <p className={SUB_CLASS}>
            {t("dashboard.hoursLogged", "Hours logged")}
          </p>
        </div>
      </button>

      {/* Skills Card */}
      <div className={STATIC_CARD_CLASS}>
        <span
          className={`${ICON_WRAPPER} bg-gradient-to-br from-amber-100 to-amber-200`}
        >
          <Award className="h-5 w-5 text-amber-600" />
        </span>
        <div className="ml-3">
          <p className={LABEL_CLASS}>{t("dashboard.skillsEndorsed")}</p>
          <p className={VALUE_CLASS}>{stats.skillsEndorsed}</p>
          <p className={SUB_CLASS}>
            {t("dashboard.endorsements", "Endorsements")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
