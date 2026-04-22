import React from "react";
import { DiscoveryShell } from "./DiscoveryShell";
import { RevenueSnapshotBar } from "./RevenueSnapshotBar";
import { EngagementVelocityChart } from "./EngagementVelocityChart";
import { ComplianceRail } from "./ComplianceRail";
import { NewsUpdatesCard } from "./NewsUpdatesCard";
import { useCharityRevenueSnapshot } from "@/hooks/useCharityRevenueSnapshot";
import { useCharityProfile } from "@/hooks/useCharityProfile";

/**
 * Authenticated charity/NGO landing for /app. Pairs an operational stats bar with an
 * engagement-velocity sparkline, a compliance rail, and a platform news card.
 */
export const CharityHubView: React.FC = () => {
  const { snapshot, loading } = useCharityRevenueSnapshot();
  const { profile: charityProfile } = useCharityProfile();
  const verified = Boolean(charityProfile?.name);

  return (
    <DiscoveryShell
      topBar={
        <RevenueSnapshotBar
          fundsRaised={snapshot.fundsRaised}
          activeCampaigns={snapshot.activeCampaigns}
          donorCount={snapshot.donorCount}
        />
      }
      main={
        <EngagementVelocityChart
          dailyTotals={snapshot.dailyTotals}
          loading={loading}
        />
      }
      rail={
        <ComplianceRail
          kycStatus={verified ? "verified" : "pending"}
          verified={verified}
          nextFilingDue={null}
        />
      }
      bottom={<NewsUpdatesCard />}
    />
  );
};
