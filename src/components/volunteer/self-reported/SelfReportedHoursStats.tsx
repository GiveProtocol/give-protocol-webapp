import React from 'react';
import { Card } from '@/components/ui/Card';
import { VolunteerHoursStats, ValidationStatus } from '@/types/selfReportedHours';
import { CheckCircle, Clock, XCircle, HelpCircle } from 'lucide-react';

interface SelfReportedHoursStatsProps {
  stats: VolunteerHoursStats;
}

/**
 * Component displaying aggregate statistics for volunteer hours
 * @param props - Component props
 * @returns JSX element
 */
export const SelfReportedHoursStats: React.FC<SelfReportedHoursStatsProps> = ({
  stats,
}) => {
  const statCards = [
    {
      label: 'Validated Hours',
      value: stats.totalValidatedHours,
      count: stats.recordsByStatus[ValidationStatus.VALIDATED],
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
    },
    {
      label: 'Pending Validation',
      value: stats.totalPendingHours,
      count: stats.recordsByStatus[ValidationStatus.PENDING],
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600',
    },
    {
      label: 'Unvalidated Hours',
      value: stats.totalUnvalidatedHours + stats.totalExpiredHours,
      count: stats.recordsByStatus[ValidationStatus.UNVALIDATED] + stats.recordsByStatus[ValidationStatus.EXPIRED],
      icon: HelpCircle,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-500',
      valueColor: 'text-gray-600',
    },
    {
      label: 'Rejected',
      value: stats.totalRejectedHours,
      count: stats.recordsByStatus[ValidationStatus.REJECTED],
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      valueColor: 'text-red-600',
      hide: stats.totalRejectedHours === 0,
    },
  ];

  const visibleCards = statCards.filter((card) => !card.hide);

  return (
    <div className={`grid gap-4 ${visibleCards.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
      {visibleCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4" hover={false}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stat.iconBg}`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.valueColor}`}>
                  {stat.value.toFixed(1)}
                  <span className="text-sm font-normal text-gray-400 ml-1">hrs</span>
                </p>
                <p className="text-xs text-gray-400">
                  {stat.count} {stat.count === 1 ? 'record' : 'records'}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default SelfReportedHoursStats;
