import React from "react";
import { Heart, CalendarClock, Flame } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

interface DonorStatBarProps {
  totalImpact: number;
  activeRecurringGrants: number;
  givingStreakMonths: number;
}

interface Tile {
  id: string;
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: React.ReactNode;
  iconClass: string;
}

/**
 * Three-tile personal impact summary shown atop the donor hub view.
 */
export const DonorStatBar: React.FC<DonorStatBarProps> = ({
  totalImpact,
  activeRecurringGrants,
  givingStreakMonths,
}) => {
  const tiles: Tile[] = [
    {
      id: "impact",
      Icon: Heart,
      label: "Total Impact",
      value: <CurrencyDisplay amount={totalImpact} />,
      iconClass:
        "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    {
      id: "recurring",
      Icon: CalendarClock,
      label: "Active Recurring Grants",
      value: activeRecurringGrants,
      iconClass:
        "text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300",
    },
    {
      id: "streak",
      Icon: Flame,
      label: "Giving Consistency",
      value: `${givingStreakMonths} mo`,
      iconClass:
        "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300",
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
