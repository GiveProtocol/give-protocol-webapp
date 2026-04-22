import React from "react";
import { DollarSign, Megaphone, Users } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

interface RevenueSnapshotBarProps {
  fundsRaised: number;
  activeCampaigns: number;
  donorCount: number;
}

interface Tile {
  id: string;
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: React.ReactNode;
  iconClass: string;
}

/**
 * Operational top-of-page stat bar for the charity hub.
 */
export const RevenueSnapshotBar: React.FC<RevenueSnapshotBarProps> = ({
  fundsRaised,
  activeCampaigns,
  donorCount,
}) => {
  const tiles: Tile[] = [
    {
      id: "funds",
      Icon: DollarSign,
      label: "Funds Raised",
      value: <CurrencyDisplay amount={fundsRaised} />,
      iconClass:
        "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    {
      id: "campaigns",
      Icon: Megaphone,
      label: "Active Campaigns",
      value: activeCampaigns,
      iconClass:
        "text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300",
    },
    {
      id: "donors",
      Icon: Users,
      label: "Donor Count",
      value: donorCount,
      iconClass:
        "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {tiles.map(({ id, Icon, label, value, iconClass }) => (
        <div
          key={id}
          className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-card border border-gray-100 dark:border-gray-800 flex items-center"
        >
          <div className={`p-3 rounded-full ${iconClass}`}>
            <Icon aria-hidden className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {label}
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
