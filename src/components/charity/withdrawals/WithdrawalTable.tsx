import React from 'react';
import { WithdrawalRequest } from '../../../types/charity';
import { WithdrawalStatus } from './WithdrawalStatus';
import { formatCurrency } from '../../../utils/money';
import { formatDate } from '../../../utils/date';

interface WithdrawalTableProps {
  withdrawals: WithdrawalRequest[];
}

const WithdrawalTable: React.FC<WithdrawalTableProps> = ({ withdrawals }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Amount
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {withdrawals.map((withdrawal) => (
          <tr key={withdrawal.id}>
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
        ))}
      </tbody>
    </table>
  );
};

export default WithdrawalTable;