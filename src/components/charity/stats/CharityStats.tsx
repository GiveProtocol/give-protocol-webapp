import React from 'react';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { StatCard } from './StatCard';
import { CharityStats as CharityStatsType } from '@/types/charity';

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
        iconColor="text-indigo-600"
        iconBgColor="bg-indigo-100"
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
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
      />
    </div>
  );
};