import React from "react";
import { ShieldCheck, FileClock, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

interface ComplianceRailProps {
  kycStatus?: "pending" | "verified" | "rejected" | null;
  verified?: boolean;
  nextFilingDue?: string | null;
}

const STATUS_LABEL: Record<NonNullable<ComplianceRailProps["kycStatus"]>, string> = {
  pending: "Pending review",
  verified: "Verified",
  rejected: "Action required",
};

const STATUS_CLASS: Record<NonNullable<ComplianceRailProps["kycStatus"]>, string> = {
  pending: "text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300",
  verified: "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300",
  rejected: "text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300",
};

/**
 * Right-rail compliance & trust summary for the charity hub. Pulls from whatever status
 * data the caller has resolved; renders placeholder copy when values are absent.
 */
export const ComplianceRail: React.FC<ComplianceRailProps> = ({
  kycStatus,
  verified,
  nextFilingDue,
}) => {
  const status = kycStatus ?? "pending";

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        Compliance &amp; Trust
      </h2>

      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">KYC Status</p>
            <span
              className={cn(
                "inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full",
                STATUS_CLASS[status],
              )}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
            <BadgeCheck aria-hidden="true" className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Platform Verification
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {verified
                ? "This organization is verified on Give Protocol."
                : "Complete verification to unlock public listings."}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            <FileClock aria-hidden="true" className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Next Filing Due
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {nextFilingDue ?? "No upcoming filings tracked yet. Enable reminders in Settings."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
