import React, { useState, useEffect } from "react";
import { Clock, XCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { getCharityVerificationStatus } from "@/services/charityVerificationService";
import type { CharityVerificationStatus } from "@/services/charityVerificationService";

interface BannerConfig {
  bg: string;
  border: string;
  Icon: React.FC<{ className?: string }>;
  iconColor: string;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}

/** Returns the banner configuration for a given charity verification status, or null if no banner is needed. */
function getBannerConfig(
  status: CharityVerificationStatus,
  reviewNotes: string | null,
): BannerConfig | null {
  switch (status) {
    case "pending":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        Icon: Clock,
        iconColor: "text-blue-600",
        title: "Application Under Review",
        body: "Your charity application is being reviewed by our team. This typically takes 3–5 business days. We will email you when a decision is made.",
      };
    case "rejected":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        Icon: XCircle,
        iconColor: "text-red-600",
        title: "Application Not Approved",
        body: reviewNotes
          ? `Reason: ${reviewNotes}`
          : "Your application was not approved at this time.",
        actionLabel: "Contact Support",
        actionHref: "mailto:support@giveprotocol.org",
      };
    case "suspended":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        Icon: AlertTriangle,
        iconColor: "text-amber-600",
        title: "Account Suspended",
        body: reviewNotes
          ? `Reason: ${reviewNotes}`
          : "Your charity account has been suspended.",
        actionLabel: "Appeal Suspension",
        actionHref: "mailto:support@giveprotocol.org",
      };
    case "approved":
    case "verified":
      return null;
    default:
      return null;
  }
}

interface VerificationStatusBannerProps {
  /** Authenticated user ID used to fetch verification status */
  userId: string;
}

/**
 * Banner shown in the charity portal when the charity's verification status
 * requires attention (pending review, rejected, or suspended).
 * Renders nothing for approved/verified charities.
 *
 * @param props.userId - Authenticated user ID
 * @returns Status banner, or null when status needs no action
 */
export const VerificationStatusBanner: React.FC<
  VerificationStatusBannerProps
> = ({ userId }) => {
  const [status, setStatus] = useState<CharityVerificationStatus | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    /** Loads verification status from the RPC on mount. */
    const load = async () => {
      const result = await getCharityVerificationStatus(userId);
      if (result) {
        setStatus(result.status);
        setReviewNotes(result.reviewNotes);
      }
      setLoaded(true);
    };

    load();
  }, [userId]);

  if (!loaded || status === null) return null;

  const config = getBannerConfig(status, reviewNotes);
  if (config === null) return null;

  const { bg, border, Icon, iconColor, title, body, actionLabel, actionHref } =
    config;

  return (
    <div
      className={`${bg} border ${border} rounded-xl p-4 mb-6 flex gap-3`}
      role="status"
      aria-live="polite"
    >
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-700 mt-0.5">{body}</p>
        {actionLabel && actionHref && (
          <a
            href={actionHref}
            className="mt-2 inline-block text-sm font-medium underline text-gray-700 hover:text-gray-900"
          >
            {actionLabel}
          </a>
        )}
      </div>
    </div>
  );
};

/** Shown when the charity is fully verified — success confirmation banner. */
export const VerificationSuccessBanner: React.FC = () => (
  <div
    className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex gap-3"
    role="status"
    aria-live="polite"
  >
    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-600" />
    <div>
      <p className="text-sm font-semibold text-gray-900">Charity Verified</p>
      <p className="text-sm text-gray-700 mt-0.5">
        Your organization is verified and donors can now support your causes.
      </p>
    </div>
  </div>
);

export default VerificationStatusBanner;
