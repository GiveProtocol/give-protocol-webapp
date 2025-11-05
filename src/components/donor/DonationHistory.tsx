import React, { useState, useCallback } from "react";
import { Download, Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/money";
import { formatDate } from "@/utils/date";
import { Button } from "@/components/ui/Button";
import { Transaction } from "@/types/contribution";
import { DonationExportModal } from "@/components/contribution/DonationExportModal";

interface DonationHistoryProps {
  donations: Transaction[];
}

const getStatusStyles = (status: string): string => {
  if (status === "completed") {
    return "bg-green-100 text-green-800";
  }
  if (status === "pending") {
    return "bg-yellow-100 text-yellow-800";
  }
  return "bg-red-100 text-red-800";
};

export const DonationHistory: React.FC<DonationHistoryProps> = ({
  donations,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");

  const handleTimeFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setTimeFilter(e.target.value);
    },
    [],
  );

  const handleShowExportModal = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleCloseExportModal = useCallback(() => {
    setShowExportModal(false);
  }, []);

  const filteredDonations = donations.filter((donation) => {
    if (timeFilter === "all") return true;

    const donationDate = new Date(donation.timestamp);
    const now = new Date();

    switch (timeFilter) {
      case "week": {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return donationDate >= weekAgo;
      }
      case "month": {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return donationDate >= monthAgo;
      }
      case "year": {
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        return donationDate >= yearAgo;
      }
      default:
        return true;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-md">
      <header className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-900">Donation History</h2>
        <nav className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={timeFilter}
            onChange={handleTimeFilterChange}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label="Filter by time period"
          >
            <option value="all">All Time</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
          <Button
            onClick={handleShowExportModal}
            variant="secondary"
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </nav>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Charity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fiat Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDonations.map((donation) => (
              <tr key={donation.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(donation.timestamp, true)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {donation.metadata?.organization || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {donation.amount} {donation.cryptoType || "GLMR"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {donation.fiatValue
                    ? formatCurrency(donation.fiatValue)
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {donation.hash ? (
                    <a
                      href={`https://moonscan.io/tx/${donation.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 truncate block max-w-xs"
                    >
                      {donation.hash.substring(0, 10)}...
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(donation.status)}`}
                  >
                    {donation.status.charAt(0).toUpperCase() +
                      donation.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <DonationExportModal
          donations={donations}
          onClose={handleCloseExportModal}
        />
      )}
    </div>
  );
};
