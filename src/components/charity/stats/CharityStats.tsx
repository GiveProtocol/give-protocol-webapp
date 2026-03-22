import React from 'react';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { StatCard } from './StatCard';
import { CharityStats as CharityStatsType } from '@/types/charity';

/**
 * CharityStats component displays key statistics for a charity including total received, equity pool value, and available balance.
 *
 * @param {number | string} totalReceived - The total amount of funds received by the charity.
 * @param {number | string} equityPoolValue - The current value of the charity's equity pool.
 * @param {number | string} availableBalance - The available balance for the charity to use.
 * @returns {JSX.Element} A grid of StatCard components showing each statistic.
 */
export const CharityStats: React.FC<CharityStatsType> = ({
  totalReceived,
  equityPoolValue,
  availableBalance
}) => {
  return (
    <div className="grid gap-6 mb-8 md:grid-cols-3">
      <StatCard
        icon={DollarSign}
        label="Total Received"
        value={totalReceived}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-100"
      />
      <StatCard
        icon={TrendingUp}
        label="Equity Pool Value"
        value={equityPoolValue}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
      />
      <StatCard
        icon={Wallet}
        label="Available Balance"
        value={availableBalance}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-100"
      />
    </div>
  );
};