import React from 'react';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { WithdrawalStatus } from './withdrawals/WithdrawalStatus';
import { formatCurrency } from '@/utils/money';
import { formatDate } from '@/utils/date';

interface Withdrawal {
  id: string;
  created_at: string;
  amount: number;
  status: string;
}

interface WithdrawalRowProps {
  withdrawal: Withdrawal;
}

/**
 * Table row component displaying a single withdrawal record
 * @param withdrawal - The withdrawal data to display
 */
const WithdrawalRow: React.FC<WithdrawalRowProps> = ({ withdrawal }) => (
  <tr>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {formatDate(withdrawal.created_at)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {formatCurrency(withdrawal.amount)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <WithdrawalStatus status={withdrawal.status} />
    </td>
  </tr>
);

interface WithdrawalTableProps {
  withdrawals: Withdrawal[];
}

/**
 * Table component displaying a list of withdrawal records
 * @param withdrawals - Array of withdrawal data to display in the table
 */
const WithdrawalTable: React.FC<WithdrawalTableProps> = ({ withdrawals }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {withdrawals?.map((withdrawal) => (
          <WithdrawalRow key={withdrawal.id} withdrawal={withdrawal} />
        ))}
      </tbody>
    </table>
  </div>
);

export const WithdrawalHistory: React.FC = () => {
  const { withdrawals, loading, error } = useWithdrawals();

  if (loading) {
    return <div>Loading&hellip;</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Withdrawal History</h2>
        <WithdrawalTable withdrawals={withdrawals} />
      </div>
    </div>
  );
};