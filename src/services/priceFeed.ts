/**
 * Price feed service for fetching cryptocurrency prices from CoinGecko API
 */

import type { PriceCache, TokenPrice } from "@/types/blockchain";
import { Logger } from "@/utils/logger";

// Use local proxy to avoid CORS issues
const COINGECKO_API_BASE = "/api/coingecko";
const CACHE_DURATION_MS = 60000; // 1 minute

/**
 * Attempts to get all prices from cache
 * @returns Cached prices if all tokens found, null otherwise
 */
function tryGetCachedPrices(
  priceCache: Record<string, TokenPrice>,
  tokenIds: string[],
  targetCurrency: string,
): Record<string, number> | null {
  const cachedPrices: Record<string, number> = {};

  for (const tokenId of tokenIds) {
    const cached = priceCache[`${tokenId}_${targetCurrency}`];
    if (cached && cached.currency === targetCurrency) {
      cachedPrices[tokenId] = cached.price;
    } else {
      return null;
    }
  }

  return cachedPrices;
}

/**
 * Gets any available stale prices from cache
 */
function getStalePrices(
  priceCache: Record<string, TokenPrice>,
  tokenIds: string[],
  targetCurrency: string,
): Record<string, number> {
  const stalePrices: Record<string, number> = {};

  for (const tokenId of tokenIds) {
    const cached = priceCache[`${tokenId}_${targetCurrency}`];
    if (cached) {
      stalePrices[tokenId] = cached.price;
    }
  }

  return stalePrices;
}

/**
 * Service for fetching and caching cryptocurrency prices from CoinGecko
 */
export class PriceFeedService {
  private priceCache: PriceCache = {
    prices: {},
    lastUpdate: 0,
  };

  /**
   * Fetch current prices for multiple tokens in a target currency
   * @param tokenIds Array of CoinGecko token IDs (e.g., ["moonbeam", "polkadot"])
   * @param targetCurrency Target currency code (e.g., "usd", "eur")
   * @returns Record of token prices by token ID
   */
  async getTokenPrices(
    tokenIds: string[],
    targetCurrency = "usd",
  ): Promise<Record<string, number>> {
    const now = Date.now();
    const cacheKey = `${tokenIds.join(",")}_${targetCurrency}`;

    // Check cache validity
    if (
      this.priceCache.lastUpdate &&
      now - this.priceCache.lastUpdate < CACHE_DURATION_MS
    ) {
      const cached = tryGetCachedPrices(
        this.priceCache.prices,
        tokenIds,
        targetCurrency,
      );
      if (cached) {
        Logger.info("Price feed: Using cached prices", { cacheKey });
        return cached;
      }
    }

    // Fetch fresh prices
    try {
      const prices = await this.fetchFreshPrices(tokenIds, targetCurrency, now);
      return prices;
    } catch (error) {
      Logger.error("Price feed: Failed to fetch prices", { error });
      return this.handleFetchError(tokenIds, targetCurrency);
    }
  }

  private async fetchFreshPrices(
    tokenIds: string[],
    targetCurrency: string,
    now: number,
  ): Promise<Record<string, number>> {
    const url = `${COINGECKO_API_BASE}/simple/price?ids=${tokenIds.join(",")}&vs_currencies=${targetCurrency}`;

    Logger.info("Price feed: Fetching prices", { tokenIds, targetCurrency });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data: Record<string, Record<string, number>> = await response.json();
    const prices: Record<string, number> = {};

    for (const tokenId of tokenIds) {
      const tokenData = data[tokenId];
      if (tokenData && tokenData[targetCurrency] !== undefined) {
        prices[tokenId] = tokenData[targetCurrency];
        this.priceCache.prices[`${tokenId}_${targetCurrency}`] = {
          tokenId,
          price: tokenData[targetCurrency],
          currency: targetCurrency,
          timestamp: now,
        };
      } else {
        Logger.warn("Price feed: Missing price data", {
          tokenId,
          targetCurrency,
        });
      }
    }

    this.priceCache.lastUpdate = now;
    Logger.info("Price feed: Fetched fresh prices", { prices });

    return prices;
  }

  private handleFetchError(
    tokenIds: string[],
    targetCurrency: string,
  ): Record<string, number> {
    const stalePrices = getStalePrices(
      this.priceCache.prices,
      tokenIds,
      targetCurrency,
    );

    if (Object.keys(stalePrices).length > 0) {
      Logger.warn("Price feed: Using stale cached prices", { stalePrices });
      return stalePrices;
    }

    throw new Error("Failed to fetch token prices and no cache available");
  }

  /**
   * Get price for a single token
   * @param tokenId CoinGecko token ID
   * @param targetCurrency Target currency code
   * @returns Token price in target currency
   */
  async getTokenPrice(
    tokenId: string,
    targetCurrency = "usd",
  ): Promise<number> {
    const prices = await this.getTokenPrices([tokenId], targetCurrency);
    const price = prices[tokenId];

    if (price === undefined) {
      throw new Error(`Price not found for token: ${tokenId}`);
    }

    return price;
  }

  /**
   * Clear the price cache
   */
  clearCache(): void {
    this.priceCache = {
      prices: {},
      lastUpdate: 0,
    };
    Logger.info("Price feed: Cache cleared");
  }

  /**
   * Get the last cache update timestamp
   * @returns Timestamp in milliseconds
   */
  getLastUpdate(): number {
    return this.priceCache.lastUpdate;
  }
}

// Export singleton instance
export const priceFeedService = new PriceFeedService();
