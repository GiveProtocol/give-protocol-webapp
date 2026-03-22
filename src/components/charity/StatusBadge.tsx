import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import type { CharityProfileStatus } from '@/types/charityProfile';

interface StatusBadgeProps {
  status: CharityProfileStatus;
}

interface StatusConfig {
  bg: string;
  text: string;
  Icon: React.FC<{ className?: string }> | null;
  label: string;
}

/**
 * Returns the display configuration for a given charity profile status.
 *
 * @param status - The current status of the charity profile.
 * @returns An object containing background and text color classes, an icon component, and a label for the status.
 */
function getStatusConfig(status: CharityProfileStatus): StatusConfig {
  switch (status) {
    case 'unclaimed':
      return { bg: 'bg-amber-100', text: 'text-amber-700', Icon: AlertTriangle, label: 'Unclaimed' };
    case 'claimed-pending':
      return { bg: 'bg-blue-100', text: 'text-blue-700', Icon: Clock, label: 'Pending Verification' };
    case 'verified':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', Icon: CheckCircle, label: 'Verified' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', Icon: null, label: status };
  }
}

/**
 * Pill badge displaying a charity profile's claim/verification status.
 * @param props - Component props
 * @param props.status - The charity profile status
 * @returns The rendered badge element
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { bg, text, Icon, label } = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
};

export default StatusBadge;
