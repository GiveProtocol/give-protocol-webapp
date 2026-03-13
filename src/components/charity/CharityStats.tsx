import React from 'react';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { StatCard } from './stats/StatCard';
import { CharityStats as CharityStatsType } from '@/types/charity';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * CharityStats component renders key financial statistics for a charity.
 *
 * @param {number|string} totalReceived - Total amount received by the charity.
 * @param {number|string} equityPoolValue - Current value of the charity's equity pool.
 * @param {number|string} availableBalance - Currently available balance for the charity.
 * @returns {JSX.Element} A grid of statistic cards displaying charity stats.
 */
export const CharityStats: React.FC<CharityStatsType> = ({
  totalReceived,
  equityPoolValue,
  availableBalance
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="grid gap-6 mb-8 md:grid-cols-3">
      <StatCard
        icon={DollarSign}
        label={t('charity.totalReceived', 'Total Received')}
        value={totalReceived}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-100"
      />
      <StatCard
        icon={TrendingUp}
        label={t('charity.equityPoolValue', 'Equity Pool Value')}
        value={equityPoolValue}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
      />
      <StatCard
        icon={Wallet}
        label={t('charity.availableBalance', 'Available Balance')}
        value={availableBalance}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-100"
      />
    </div>
  );
};