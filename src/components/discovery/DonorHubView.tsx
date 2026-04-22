import React from "react";
import { DiscoveryShell } from "./DiscoveryShell";
import { DonorStatBar } from "./DonorStatBar";
import { PersonalizedGrid } from "./PersonalizedGrid";
import { DailyWisdomCard } from "./DailyWisdomCard";
import { useDonorData } from "@/hooks/useDonorData";
import { useGivingStreak } from "@/hooks/useGivingStreak";
import { useScheduledDonations } from "@/hooks/useScheduledDonations";

/**
 * Authenticated donor/volunteer landing for /app. Combines personal impact stats, a
 * personalized discovery grid, and a Daily Wisdom card in the bottom-left slot.
 */
export const DonorHubView: React.FC = () => {
  const { data } = useDonorData();
  const { count: activeRecurringGrants } = useScheduledDonations();
  const streak = useGivingStreak(data?.donations);

  const totalImpact = data?.totalDonated ?? 0;
  const donations = data?.donations;

  const bottom = (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6">
      <DailyWisdomCard />
      <div className="hidden lg:block" aria-hidden="true" />
    </div>
  );

  return (
    <DiscoveryShell
      topBar={
        <DonorStatBar
          totalImpact={totalImpact}
          activeRecurringGrants={activeRecurringGrants}
          givingStreakMonths={streak}
        />
      }
      main={<PersonalizedGrid donations={donations} />}
      bottom={bottom}
    />
  );
};
