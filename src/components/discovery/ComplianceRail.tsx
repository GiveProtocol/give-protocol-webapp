import React from "react";
import type { LucideIcon } from "lucide-react";
import { ShieldCheck, FileClock, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

interface ComplianceRailProps {
  kycStatus?: "pending" | "verified" | "rejected" | null;
  verified?: boolean;
  nextFilingDue?: string | null;
}

const STATUS_LABEL: Record<
  NonNullable<ComplianceRailProps["kycStatus"]>,
  string
> = {
  pending: "Pending review",
  verified: "Verified",
  rejected: "Action required",
};

const STATUS_CLASS: Record<
  NonNullable<ComplianceRailProps["kycStatus"]>,
  string
> = {
  pending:
    "text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300",
  verified:
    "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300",
  rejected: "text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300",
};

interface RowProps {
  Icon: LucideIcon;
  iconWrapperClass: string;
  label: string;
  children: React.ReactNode;
}

/**
 * Single row of the compliance rail: icon, label, and body content.
 * Factored out to keep the parent's JSX tree within lint nesting limits.
 */
function ComplianceRow({ Icon, iconWrapperClass, label, children }: RowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn("p-1.5 rounded-lg", iconWrapperClass)}>
        <Icon aria-hidden="true" className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

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
        <ComplianceRow
          Icon={ShieldCheck}
          iconWrapperClass="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
          label="KYC Status"
        >
          <span
            className={cn(
              "inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full",
              STATUS_CLASS[status],
            )}
          >
            {STATUS_LABEL[status]}
          </span>
        </ComplianceRow>

        <ComplianceRow
          Icon={BadgeCheck}
          iconWrapperClass="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
          label="Platform Verification"
        >
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {verified
              ? "This organization is verified on Give Protocol."
              : "Complete verification to unlock public listings."}
          </p>
        </ComplianceRow>

        <ComplianceRow
          Icon={FileClock}
          iconWrapperClass="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
          label="Next Filing Due"
        >
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {nextFilingDue ??
              "No upcoming filings tracked yet. Enable reminders in Settings."}
          </p>
        </ComplianceRow>
      </div>
    </Card>
  );
};
