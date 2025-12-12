import React from 'react';
import { ValidationStatus } from '@/types/selfReportedHours';
import { CheckCircle, Clock, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface ValidationStatusBadgeProps {
  status: ValidationStatus;
  daysUntilExpiration?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<ValidationStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  [ValidationStatus.VALIDATED]: {
    label: 'Validated',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    Icon: CheckCircle,
  },
  [ValidationStatus.PENDING]: {
    label: 'Pending',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    Icon: Clock,
  },
  [ValidationStatus.REJECTED]: {
    label: 'Rejected',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    Icon: XCircle,
  },
  [ValidationStatus.UNVALIDATED]: {
    label: 'Unvalidated',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    Icon: HelpCircle,
  },
  [ValidationStatus.EXPIRED]: {
    label: 'Expired',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    Icon: AlertCircle,
  },
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const ICON_SIZES = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

/**
 * Badge component displaying validation status with appropriate color and icon
 * @param props - Component props
 * @returns JSX element
 */
export const ValidationStatusBadge: React.FC<ValidationStatusBadgeProps> = ({
  status,
  daysUntilExpiration,
  showLabel = true,
  size = 'md',
}) => {
  const config = STATUS_CONFIG[status];
  const { Icon } = config;

  const showDays = status === ValidationStatus.PENDING && daysUntilExpiration !== undefined;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.textColor} ${SIZE_CLASSES[size]}`}
    >
      <Icon className={ICON_SIZES[size]} />
      {showLabel && (
        <span>
          {config.label}
          {showDays && ` (${daysUntilExpiration}d)`}
        </span>
      )}
    </span>
  );
};

export default ValidationStatusBadge;
