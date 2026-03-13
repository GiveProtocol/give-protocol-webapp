import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import type { CharityProfileStatus } from '@/types/charityProfile';

interface StatusBadgeProps {
  status: CharityProfileStatus;
}

/**
 * Returns the configuration for a given charity profile status, including background color, text color, icon, and label.
 *
 * @param status - The status of the charity profile.
 * @returns An object containing bg, text, icon, and label properties for the status badge.
 */
function getStatusConfig(status: CharityProfileStatus) {
  switch (status) {
    case 'unclaimed':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,       
        label: 'Unclaimed',
      };
    case 'claimed-pending':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: <Clock className="h-3.5 w-3.5" />,
        label: 'Pending Verification',
      };
    case 'verified':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        icon: <CheckCircle className="h-3.5 w-3.5" />,       
        label: 'Verified',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        icon: null,
        label: status,
      };
  }
}

/**
 * Pill badge displaying a charity profile's claim/verification status.
 * @param props - Component props
 * @param props.status - The charity profile status
 * @returns The rendered badge element
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { bg, text, icon, label } = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      {icon}
      {label}
    </span>
  );
};

export default StatusBadge;
