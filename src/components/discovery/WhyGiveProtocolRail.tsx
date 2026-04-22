import React from "react";
import { ShieldCheck, Coins, HeartHandshake } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface RailItem {
  id: string;
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  body: string;
}

const ITEMS: RailItem[] = [
  {
    id: "verified",
    Icon: ShieldCheck,
    title: "Verified nonprofits",
    body: "Every organization is matched against public registries before appearing on the platform.",
  },
  {
    id: "onchain",
    Icon: Coins,
    title: "On-chain transparency",
    body: "Donations are recorded on the blockchain so you can trace your impact from wallet to cause.",
  },
  {
    id: "volunteer",
    Icon: HeartHandshake,
    title: "Give time, not just money",
    body: "Volunteer hours are verified by charities and count toward your protocol reputation.",
  },
];

/**
 * Static explainer rail shown on the public /app view. Replaces passive whitespace on wide
 * screens with social-proof content.
 */
export const WhyGiveProtocolRail: React.FC = () => {
  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        Why Give Protocol
      </h2>
      <ul className="mt-4 space-y-4">
        {ITEMS.map(({ id, Icon, title, body }) => (
          <li key={id} className="flex gap-3">
            <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              <Icon aria-hidden className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};
