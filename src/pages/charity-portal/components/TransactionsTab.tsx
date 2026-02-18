import React, { useCallback, useMemo } from "react";
import {
  Download,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  FileText,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Transaction } from "@/types/contribution";
import { formatDate } from "@/utils/date";
import { useTranslation } from "@/hooks/useTranslation";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

interface SortConfig {
  key: "date" | "type" | "status" | "organization" | null;
  direction: "asc" | "desc";
}

interface TransactionsTabProps {
  transactions: Transaction[];
  sortConfig: SortConfig;
  onSort: (_sortKey: "date" | "type" | "status" | "organization") => void;
  onShowExportModal: () => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  sortConfig,
  onSort,
  onShowExportModal,
}) => {
  const { t } = useTranslation();

  const handleSortByDate = useCallback(() => onSort("date"), [onSort]);
  const handleSortByType = useCallback(() => onSort("type"), [onSort]);
  const handleSortByOrganization = useCallback(
    () => onSort("organization"),
    [onSort],
  );
  const handleSortByStatus = useCallback(() => onSort("status"), [onSort]);

  const getSortIcon = useCallback(
    (columnKey: "date" | "type" | "status" | "organization") => {
      if (sortConfig.key !== columnKey) {
        return <ChevronUp className="h-4 w-4 text-gray-300" />;
      }
      return sortConfig.direction === "asc" ? (
        <ChevronUp className="h-4 w-4 text-gray-600" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-600" />
      );
    },
    [sortConfig],
  );

  const sortedTransactions = useMemo(() => {
    if (!sortConfig.key) return transactions;

    return [...transactions].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.key) {
        case "date":
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case "type":
          aValue = a.purpose.toLowerCase();
          bValue = b.purpose.toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case "organization":
          aValue = (
            a.metadata?.organization ||
            a.metadata?.donor ||
            "Anonymous"
          ).toLowerCase();
          bValue = (
            b.metadata?.organization ||
            b.metadata?.donor ||
            "Anonymous"
          ).toLowerCase();
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const compareResult = aValue.localeCompare(bValue);
        return sortConfig.direction === "asc" ? compareResult : -compareResult;
      }
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [transactions, sortConfig]);

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("charity.transactions")}
          </h2>
          <Button
            onClick={onShowExportModal}
            variant="secondary"
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <Download className="h-4 w-4 text-indigo-600" />
            {t("contributions.export")}
          </Button>
        </div>
        <div className="py-16 px-6 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("transactions.noTransactionsYet", "No transactions yet")}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {t(
              "transactions.noTransactionsDescription",
              "Your donation history will appear here once you receive contributions.",
            )}
          </p>
          <Button
            variant="secondary"
            className="inline-flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            {t("transactions.shareDonationPage", "Share donation page")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("charity.transactions")}
        </h2>
        <Button
          onClick={onShowExportModal}
          variant="secondary"
          className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
        >
          <Download className="h-4 w-4 text-indigo-600" />
          {t("contributions.export")}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={handleSortByDate}
              >
                <span className="flex items-center gap-1">
                  {t("contributions.date")}
                  {getSortIcon("date")}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={handleSortByType}
              >
                <span className="flex items-center gap-1">
                  {t("contributions.type")}
                  {getSortIcon("type")}
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={handleSortByOrganization}
              >
                <span className="flex items-center gap-1">
                  {t("donor.volunteer", "Donor/Volunteer")}
                  {getSortIcon("organization")}
                </span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("contributions.details")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={handleSortByStatus}
              >
                <span className="flex items-center gap-1">
                  {t("contributions.status")}
                  {getSortIcon("status")}
                </span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("contributions.verification")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(transaction.timestamp, true)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {t(
                    `contribution.type.${transaction.purpose.toLowerCase().replace(" ", "")}`,
                    transaction.purpose,
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.metadata?.organization ||
                    transaction.metadata?.donor ||
                    t("donor.anonymous", "Anonymous")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-medium">
                    {transaction.amount} {transaction.cryptoType}
                  </span>
                  <span className="text-gray-500 ml-1">
                    (<CurrencyDisplay amount={transaction.fiatValue || 0} />)
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${{
                      completed: "bg-green-100 text-green-800",
                      pending: "bg-yellow-100 text-yellow-800",
                    }[transaction.status] || "bg-red-100 text-red-800"}`}
                  >
                    {t(
                      `status.${transaction.status}`,
                      transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1),
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.hash ? (
                    <a
                      href={`https://moonscan.io/tx/${transaction.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                    >
                      <span className="truncate max-w-[100px]">
                        {transaction.hash.substring(0, 10)}...
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    t("common.notAvailable", "N/A")
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTab;
