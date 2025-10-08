import { useSettings } from '@/contexts/SettingsContext';
import { CURRENCY_SYMBOLS, EXCHANGE_RATES } from '@/utils/money';

/**
 * Custom hook for currency formatting and conversion
 */
export const useCurrency = () => {
  const { currency } = useSettings();
  
  /**
   * Format a number as currency with the user's preferred currency
   * @param amount Amount in USD to format
   */
  const formatAmount = (amount: number): string => {
    // Convert from USD to the target currency
    const rate = EXCHANGE_RATES[currency] || 1;
    const convertedAmount = amount * rate;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedAmount);
  };
  
  /**
   * Get the currency symbol for the current currency
   */
  const getCurrencySymbol = (): string => {
    return CURRENCY_SYMBOLS[currency] || '$';
  };
  
  /**
   * Convert an amount from USD to the current currency
   * @param amount Amount in USD to convert
   */
  const convertFromUSD = (amount: number): number => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return amount * rate;
  };
  
  /**
   * Convert an amount from the current currency to USD
   * @param amount Amount in current currency to convert
   */
  const convertToUSD = (amount: number): number => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return amount / rate;
  };
  
  return {
    formatAmount,
    getCurrencySymbol,
    convertFromUSD,
    convertToUSD,
    currency
  };
};