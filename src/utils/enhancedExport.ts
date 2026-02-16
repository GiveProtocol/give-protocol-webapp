import { Transaction } from "@/types/contribution";
import {
  VolunteerTransactionTypes,
  type VolunteerTransactionType,
} from "@/types/volunteerTransaction";
import { formatDate } from "./date";
import { convertToCSV, downloadCSV } from "./csvHelpers";

/**
 * Enhanced export data structure that includes all transaction types
 */
export interface EnhancedExportData {
  // Common fields
  date: string;
  type: string;
  cryptoType: string;
  amount: string;
  purpose: string;
  transactionHash: string;
  fiatValue: string;
  transactionFee: string;
  senderAddress: string;
  recipientAddress: string;
  organization: string;
  verificationHash: string;
  blockNumber: string;

  // Volunteer-specific fields
  volunteerHours?: string;
  startTime?: string;
  endTime?: string;
  skills?: string;
  opportunity?: string;
  applicationText?: string;
  availability?: string;
  acceptanceDate?: string;
  acceptedBy?: string;
  endorsementText?: string;
  transactionInitiator?: string;
  relatedTransactionId?: string;
  description?: string;

  // Fiat donation fields
  paymentMethod?: string;
  cardLastFour?: string;
  disbursementStatus?: string;
}

/**
 * Helper function to format common transaction fields
 * @param transaction Transaction object
 * @returns Object with formatted common fields
 */
function formatCommonFields(transaction: Transaction) {
  return {
    date: formatDate(transaction.timestamp, true),
    type: transaction.purpose || "Donation",
    cryptoType: transaction.cryptoType || "",
    amount: transaction.amount ? transaction.amount.toString() : "0",
    purpose: transaction.purpose || "Donation",
    transactionHash: transaction.hash || "",
    fiatValue: transaction.fiatValue
      ? `$${transaction.fiatValue.toFixed(2)}`
      : "$0.00",
    transactionFee: transaction.fee ? transaction.fee.toString() : "0",
    senderAddress: transaction.from || "",
    recipientAddress: transaction.to || "",
  };
}

/**
 * Helper function to format metadata fields
 * @param metadata Transaction metadata object
 * @returns Object with formatted metadata fields
 */
function formatMetadataFields(metadata: Record<string, unknown>) {
  return {
    organization: metadata.organization || "",
    verificationHash: metadata.verificationHash || "",
    blockNumber: metadata.blockNumber ? metadata.blockNumber.toString() : "",
    description: metadata.description || metadata.category || "",
  };
}

/**
 * Helper function to format fiat-specific fields from metadata
 * @param metadata Transaction metadata object
 * @returns Object with formatted fiat donation fields
 */
function formatFiatFields(metadata: Record<string, unknown>) {
  if (!metadata.isFiatDonation) {
    return {};
  }
  return {
    paymentMethod: metadata.paymentMethod || "",
    cardLastFour: metadata.cardLastFour || "",
    disbursementStatus: metadata.disbursementStatus || "",
  };
}

/**
 * Helper function to format volunteer-specific fields
 * @param metadata Transaction metadata object
 * @returns Object with formatted volunteer fields
 */
function formatVolunteerFields(metadata: Record<string, unknown>) {
  return {
    volunteerHours: metadata.hours ? metadata.hours.toString() : "",
    startTime: metadata.startTime || "",
    endTime: metadata.endTime || "",
    skills: Array.isArray(metadata.skills) ? metadata.skills.join("; ") : "",
    opportunity: metadata.opportunity || "",
    applicationText: metadata.applicationText || "",
    availability: metadata.availability || "",
    acceptanceDate: metadata.acceptanceDate || "",
    acceptedBy: metadata.acceptedBy || "",
    endorsementText: metadata.endorsementText || "",
    transactionInitiator: metadata.transactionInitiator || "",
    relatedTransactionId: metadata.relatedTransactionId || "",
  };
}

/**
 * Formats all transaction types for enhanced CSV export
 * @param transactions Array of transactions (donations and volunteer activities)
 * @returns Formatted data ready for CSV export with all fields
 */
export function formatTransactionsForEnhancedExport(
  transactions: Transaction[],
): EnhancedExportData[] {
  return transactions.map((transaction) => {
    const metadata = transaction.metadata || {};

    return {
      ...formatCommonFields(transaction),
      ...formatMetadataFields(metadata),
      ...formatVolunteerFields(metadata),
      ...formatFiatFields(metadata),
    };
  });
}

/**
 * Determines which fields to include based on transaction types present
 * @param transactions Array of transactions
 * @returns Object with field names as keys and whether to include them as values
 */
export function getFieldsToInclude(
  transactions: Transaction[],
): Record<string, boolean> {
  const hasVolunteerTransactions = transactions.some((t) =>
    Object.values(VolunteerTransactionTypes).includes(
      t.purpose as VolunteerTransactionType,
    ),
  );

  const hasDonations = transactions.some(
    (t) => t.purpose === "Donation" || (t.amount && t.amount > 0),
  );

  const hasFiatDonations = transactions.some(
    (t) => t.purpose === "Fiat Donation",
  );

  return {
    // Always include these
    date: true,
    type: true,
    organization: true,
    transactionHash: true,
    verificationHash: true,
    blockNumber: true,

    // Include for donations
    cryptoType: hasDonations,
    amount: hasDonations,
    fiatValue: hasDonations,
    transactionFee: hasDonations,

    // Include for volunteer transactions
    volunteerHours: hasVolunteerTransactions,
    startTime: hasVolunteerTransactions,
    endTime: hasVolunteerTransactions,
    skills: hasVolunteerTransactions,
    opportunity: hasVolunteerTransactions,
    applicationText: hasVolunteerTransactions,
    availability: hasVolunteerTransactions,
    acceptanceDate: hasVolunteerTransactions,
    acceptedBy: hasVolunteerTransactions,
    endorsementText: hasVolunteerTransactions,
    transactionInitiator: hasVolunteerTransactions,
    relatedTransactionId: hasVolunteerTransactions,
    description: true,

    // Include for fiat donations
    paymentMethod: hasFiatDonations,
    cardLastFour: hasFiatDonations,
    disbursementStatus: hasFiatDonations,

    // Always include addresses for transparency
    senderAddress: true,
    recipientAddress: true,
  };
}

/**
 * Converts data to CSV format with selective field inclusion
 * @param data Array of objects to convert
 * @param includeFields Object specifying which fields to include
 * @returns CSV string
 */
export function convertToCSVWithFields<T extends Record<string, unknown>>(
  data: T[],
  includeFields?: Record<string, boolean>,
): string {
  if (data.length === 0) return "";

  if (!includeFields) {
    return convertToCSV(data);
  }

  const allowedKeys = new Set(
    Object.keys(includeFields).filter((key) => includeFields[key]),
  );

  const filteredData = data.map((row) => {
    const filtered: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in row) {
        filtered[key] = row[key];
      }
    }
    return filtered;
  });

  return convertToCSV(filteredData);
}

/**
 * Exports transactions to CSV with enhanced fields
 * @param transactions Array of all transaction types
 * @param filename Optional filename (defaults to contributions_YYYY-MM-DD.csv)
 * @param includeAllFields Whether to include all fields or only relevant ones
 */
export function exportEnhancedTransactionsToCSV(
  transactions: Transaction[],
  filename?: string,
  includeAllFields = false,
): void {
  const formattedData = formatTransactionsForEnhancedExport(transactions);
  const fieldsToInclude = includeAllFields
    ? undefined
    : getFieldsToInclude(transactions);
  const csvData = convertToCSVWithFields(formattedData, fieldsToInclude);
  const defaultFilename = `contributions_${new Date().toISOString().split("T")[0]}.csv`;

  downloadCSV(csvData, filename || defaultFilename);
}
