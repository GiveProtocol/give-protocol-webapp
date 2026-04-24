import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Megaphone, PlusCircle } from "lucide-react";
import { DiscoveryShell } from "./DiscoveryShell";
import { RevenueSnapshotBar } from "./RevenueSnapshotBar";
import { EngagementVelocityChart } from "./EngagementVelocityChart";
import { ComplianceRail } from "./ComplianceRail";
import { NewsUpdatesCard } from "./NewsUpdatesCard";
import { Card } from "@/components/ui/Card";
import { useCharityRevenueSnapshot } from "@/hooks/useCharityRevenueSnapshot";
import { useCharityProfile } from "@/hooks/useCharityProfile";

interface QuickLinkSpec {
  id: string;
  to: string;
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  description: string;
}

const QUICK_LINKS: QuickLinkSpec[] = [
  {
    id: "portal",
    to: "/charity-portal",
    Icon: LayoutDashboard,
    label: "Open full portal",
    description: "Manage donations, volunteers, and causes in one place.",
  },
  {
    id: "cause",
    to: "/charity-portal/create-cause",
    Icon: PlusCircle,
    label: "Start a new cause",
    description: "Launch a fundraising campaign for a specific project.",
  },
  {
    id: "opportunity",
    to: "/charity-portal/create-opportunity",
    Icon: Megaphone,
    label: "Post a volunteer opportunity",
    description: "Recruit skilled supporters from the Give Protocol community.",
  },
];

/**
 * Authenticated charity/NGO landing for /app. Pairs an operational stats bar
 * with an engagement-velocity sparkline, a right rail with compliance status
 * and platform news, and a quick-links panel for common operator actions.
 */
export const CharityHubView: React.FC = () => {
  const { snapshot, loading } = useCharityRevenueSnapshot();
  const { profile: charityProfile } = useCharityProfile();
  const verified = Boolean(charityProfile?.name);

  const quickLinks = (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Quick Actions
      </h2>
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_LINKS.map(({ id, to, Icon, label, description }) => (
          <li key={id}>
            <Link
              to={to}
              className="block h-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-emerald-500 hover:shadow-card-hover transition-all"
            >
              <div className="inline-flex p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                <Icon aria-hidden className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {label}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );

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
        <>
          <EngagementVelocityChart
            dailyTotals={snapshot.dailyTotals}
            loading={loading}
          />
          {quickLinks}
        </>
      }
      rail={
        <>
          <ComplianceRail
            kycStatus={verified ? "verified" : "pending"}
            verified={verified}
            nextFilingDue={null}
          />
          <NewsUpdatesCard />
        </>
      }
    />
  );
};
