import { Transaction } from '@/types/contribution';
import { formatDate } from './date';

export interface DonationExportData {
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
  details: string;
  verificationHash: string;
  blockNumber: string;
}

/**
 * Formats donation data for CSV export
 * @param donations Array of donation transactions
 * @returns Formatted data ready for CSV export
 */
export function formatDonationsForExport(donations: Transaction[]): DonationExportData[] {
  return donations.map(donation => ({
    date: formatDate(donation.timestamp, true), // true for including time
    type: donation.purpose || 'Donation',
    cryptoType: donation.cryptoType || '',
    amount: donation.amount ? donation.amount.toString() : '0',
    purpose: donation.purpose || 'Donation',
    transactionHash: donation.hash || '',
    fiatValue: donation.fiatValue ? `$${donation.fiatValue.toFixed(2)}` : '',
    transactionFee: donation.fee ? donation.fee.toString() : '',
    senderAddress: donation.from || '',
    recipientAddress: donation.to || '',
    details: donation.metadata?.description || donation.metadata?.opportunity || donation.metadata?.category || '',
    verificationHash: donation.metadata?.verificationHash || '',
    blockNumber: donation.metadata?.blockNumber ? donation.metadata.blockNumber.toString() : ''
  }));
}

/**
 * Converts data to CSV format
 * @param data Array of objects to convert
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, unknown>>(data: T[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(',');
  
  const rows = data.map(row => {
    return headers.map(header => {
      // Handle values that might contain commas or quotes
      const value = row[header] === null || row[header] === undefined ? '' : row[header];
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });
  
  return [headerRow, ...rows].join('\n');
}

/**
 * Downloads data as a CSV file
 * @param data CSV string
 * @param filename Filename for the downloaded file
 */
export function downloadCSV(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports donation data to CSV
 * @param donations Array of donation transactions
 * @param filename Optional filename (defaults to donations_YYYY-MM-DD.csv)
 */
export function exportDonationsToCSV(donations: Transaction[], filename?: string): void {
  const formattedData = formatDonationsForExport(donations);
  const csvData = convertToCSV(formattedData);
  const defaultFilename = `contributions_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvData, filename || defaultFilename);
}