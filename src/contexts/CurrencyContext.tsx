import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { FiatCurrency, SUPPORTED_CURRENCIES, getCurrencyByCode } from "@/config/tokens";
import { priceFeedService } from "@/services/priceFeed";
import { useWeb3 } from "@/contexts/Web3Context";
import { Logger } from "@/utils/logger";

interface CurrencyContextType {
  selectedCurrency: FiatCurrency;
  setSelectedCurrency: (_currency: FiatCurrency) => void;
  tokenPrices: Record<string, number>;
  isLoading: boolean;
  refreshPrices: () => Promise<void>;
  convertToFiat: (_cryptoAmount: number, _tokenCoingeckoId: string) => number;
  convertFromFiat: (_fiatAmount: number, _tokenCoingeckoId: string) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: React.ReactNode;
}

/**
 * Currency provider that manages token prices and fiat currency selection
 * @component CurrencyProvider
 * @description Provides real-time cryptocurrency prices and fiat currency conversion throughout the app.
 * Automatically refreshes prices every minute and persists user currency preference to localStorage.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to currency context
 * @returns {React.ReactElement} Provider component wrapping children with currency context
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <CurrencyProvider>
 *       <YourApp />
 *     </CurrencyProvider>
 *   );
 * }
 * ```
 */
export function CurrencyProvider({ children }: CurrencyProviderProps): React.ReactElement {
  const { chainId } = useWeb3();

  const [selectedCurrency, setSelectedCurrencyState] = useState<FiatCurrency>(() => {
    if (typeof window === "undefined") {
      return SUPPORTED_CURRENCIES[0]; // USD default
    }

    const saved = localStorage.getItem("preferredCurrency");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const currency = getCurrencyByCode(parsed.code);
        return currency || SUPPORTED_CURRENCIES[0];
      } catch {
        // Invalid JSON, use default
      }
    }

    return SUPPORTED_CURRENCIES[0]; // USD default
  });

  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Update price feed service with current chain ID for Chainlink lookups
  useEffect(() => {
    if (chainId) {
      priceFeedService.setChainId(chainId);
    }
  }, [chainId]);

  const refreshPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all token prices in the selected currency
      const currencyCode = selectedCurrency.coingeckoId.toLowerCase();

      // Get prices for all tokens we support (including ethereum for ETH/WETH)
      const tokenIds = [
        "ethereum",
        "moonbeam",
        "wrapped-moonbeam",
        "polkadot",
        "usd-coin",
        "tether",
        "dai",
        "optimism",
      ];

      const prices = await priceFeedService.getTokenPrices(tokenIds, currencyCode);

      setTokenPrices(prices);

      Logger.info("Currency context: Prices refreshed", {
        currency: selectedCurrency.code,
        priceCount: Object.keys(prices).length,
        source: currencyCode === "usd" ? "chainlink" : "coingecko",
      });
    } catch (error) {
      Logger.error("Currency context: Failed to refresh prices", { error });
      // Keep existing prices on error
    } finally {
      setIsLoading(false);
    }
  }, [selectedCurrency]);

  // Refresh prices when currency changes
  useEffect(() => {
    refreshPrices();
  }, [refreshPrices]);

  // Auto-refresh prices every minute
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPrices();
    }, 60000); // 1 minute

    return () => {
      clearInterval(interval);
    };
  }, [refreshPrices]);

  // Save currency preference
  const setSelectedCurrency = useCallback((currency: FiatCurrency) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredCurrency", JSON.stringify(currency));
    }
    setSelectedCurrencyState(currency);
  }, []);

  // Convert crypto amount to fiat
  const convertToFiat = useCallback(
    (cryptoAmount: number, tokenCoingeckoId: string): number => {
      const price = tokenPrices[tokenCoingeckoId];
      if (price === undefined) {
        Logger.warn("Currency context: Price not available for token", {
          tokenCoingeckoId,
        });
        return 0;
      }
      return cryptoAmount * price;
    },
    [tokenPrices]
  );

  // Convert fiat amount to crypto
  const convertFromFiat = useCallback(
    (fiatAmount: number, tokenCoingeckoId: string): number => {
      const price = tokenPrices[tokenCoingeckoId];
      if (price === undefined || price === 0) {
        Logger.warn("Currency context: Price not available for token", {
          tokenCoingeckoId,
        });
        return 0;
      }
      return fiatAmount / price;
    },
    [tokenPrices]
  );

  const contextValue = React.useMemo(
    () => ({
      selectedCurrency,
      setSelectedCurrency,
      tokenPrices,
      isLoading,
      refreshPrices,
      convertToFiat,
      convertFromFiat,
    }),
    [selectedCurrency, setSelectedCurrency, tokenPrices, isLoading, refreshPrices, convertToFiat, convertFromFiat]
  );

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook to access currency context
 * @function useCurrencyContext
 * @description Provides access to currency management functionality including token prices,
 * currency selection, and conversion utilities.
 * @returns {CurrencyContextType} Currency context with prices, converters, and currency selection
 * @throws {Error} If used outside of CurrencyProvider
 * @example
 * ```tsx
 * function DonationForm() {
 *   const { selectedCurrency, tokenPrices, convertToFiat } = useCurrencyContext();
 *
 *   const glmrPrice = tokenPrices['moonbeam'];
 *   const fiatValue = convertToFiat(10, 'moonbeam');
 *
 *   return <div>10 GLMR = {fiatValue} {selectedCurrency.code}</div>;
 * }
 * ```
 */
export function useCurrencyContext(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrencyContext must be used within CurrencyProvider");
  }
  return context;
}
