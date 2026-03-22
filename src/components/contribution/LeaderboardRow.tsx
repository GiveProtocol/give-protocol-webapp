import React from 'react';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/money';

interface LeaderboardRowProps {
  rank: number;
  name: string;
  value: number;
  change: number;
  isCurrentUser?: boolean;
  metric?: 'donations' | 'hours';
  walletAddress?: string;
}

/**
 * LeaderboardRow component renders a row in the leaderboard with rank, name, formatted value, and change indicator.
 *
 * @param {number} rank - The rank position to display.
 * @param {string} name - The name to display.
 * @param {number} value - The numeric value to display, formatted as currency.
 * @param {number} change - The change in value compared to the previous period.
 * @param {boolean} [isCurrentUser] - Whether this row represents the current user.
 * @param {'donations'|'hours'} [metric] - The metric type, either donations or hours.
 * @param {string} [walletAddress] - The wallet address to display in abbreviated form.
 * @returns {JSX.Element} The rendered leaderboard row element.
 */
export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  name,
  value,
  change,
  isCurrentUser,
  metric = 'donations',
  walletAddress
}) => {
  /**
   * Returns a trophy icon for the top 3 ranks.
   *
   * @returns {JSX.Element|null} The trophy icon component if rank <= 3, otherwise null.
   */
  const getRankIcon = () => {
    if (rank <= 3) {
      const colors = {
        1: 'text-yellow-500',
        2: 'text-gray-400',
        3: 'text-amber-600'
      };
      return <Trophy className={`h-5 w-5 ${colors[rank as keyof typeof colors]}`} />;
    }
    return null;
  };

  return (
    <div className={``
      flex items-center justify-between p-4 rounded-lg
      ${isCurrentUser ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50'}
      ${rank <= 3 ? 'border-l-4 border-l-yellow-500' : ''}
    `}>
      <div className="flex items-center space-x-4">
        <div className="w-8 text-center">
          {getRankIcon() || <span className="text-gray-600">{rank}</span>}
        </div>
        <div>
          <span className="font-medium text-gray-900">{name}</span>
          {walletAddress && (
            <span className="text-xs text-gray-500 block font-mono">{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="font-semibold text-gray-900">
          {metric === 'donations' ? formatCurrency(value) : `${value} hours`}
        </span>
        
        <div className={`flex items-center ${
          change > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change > 0 ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          <span className="text-sm">{Math.abs(change)}%</span>
        </div>
      </div>
    </div>
  );
};