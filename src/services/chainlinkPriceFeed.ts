/**
 * Chainlink Price Feed Service
 * Reads cryptocurrency prices directly from Chainlink oracle contracts on-chain
 */

import { ethers, type Provider } from "ethers";
import { Logger } from "@/utils/logger";
import {
  AGGREGATOR_V3_ABI,
  CHAINLINK_FEEDS,
  SEQUENCER_UPTIME_FEEDS,
  COINGECKO_TO_SYMBOL,
  type PriceFeedConfig,
} from "@/config/chainlink";
import { CHAIN_IDS, type ChainId } from "@/config/contracts";

/** Price data returned from Chainlink */
export interface ChainlinkPriceData {
  /** Price in USD (already formatted with proper decimals) */
  price: number;
  /** Token symbol */
  symbol: string;
  /** Timestamp when price was last updated on-chain */
  updatedAt: number;
  /** Whether this data passed all validation checks */
  isValid: boolean;
}

/** Cache entry for price data */
interface PriceCacheEntry {
  data: ChainlinkPriceData;
  fetchedAt: number;
}

/** Grace period after sequencer comes back up (1 hour) */
const SEQUENCER_GRACE_PERIOD = 3600;

/** Local cache TTL in milliseconds */
const CACHE_TTL_MS = 30000; // 30 seconds

/** Default RPC endpoints for chains */
const DEFAULT_RPC_ENDPOINTS: Record<ChainId, string> = {
  [CHAIN_IDS.BASE]: "https://mainnet.base.org",
  [CHAIN_IDS.OPTIMISM]: "https://mainnet.optimism.io",
  [CHAIN_IDS.MOONBEAM]: "https://rpc.api.moonbeam.network",
  [CHAIN_IDS.BASE_SEPOLIA]: "https://sepolia.base.org",
  [CHAIN_IDS.OPTIMISM_SEPOLIA]: "https://sepolia.optimism.io",
  [CHAIN_IDS.MOONBASE]: "https://rpc.api.moonbase.moonbeam.network",
};

/**
 * Chainlink Price Feed Service
 * Provides decentralized price data from Chainlink oracle networks
 */
export class ChainlinkPriceFeedService {
  private priceCache: Map<string, PriceCacheEntry> = new Map();
  private providerCache: Map<number, Provider> = new Map();

  /**
   * Get or create a provider for a chain
   */
  private getProvider(chainId: ChainId): Provider {
    const cached = this.providerCache.get(chainId);
    if (cached) return cached;

    const rpcUrl = DEFAULT_RPC_ENDPOINTS[chainId];
    if (!rpcUrl) {
      throw new Error(`No RPC endpoint configured for chain ${chainId}`);
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    this.providerCache.set(chainId, provider);
    return provider;
  }

  /**
   * Check if L2 sequencer is up and past grace period
   * Required for Base and Optimism to ensure price data is fresh
   */
  private async checkSequencerUptime(
    chainId: ChainId,
    provider: Provider,
  ): Promise<boolean> {
    const sequencerFeedAddress = SEQUENCER_UPTIME_FEEDS[chainId];
    if (!sequencerFeedAddress) {
      // Chain doesn't have sequencer feed (L1 or non-supported L2)
      return true;
    }

    try {
      const sequencerFeed = new ethers.Contract(
        sequencerFeedAddress,
        AGGREGATOR_V3_ABI,
        provider,
      );

      const roundData = await sequencerFeed.latestRoundData();
      const answer = roundData[1]; // answer field
      const startedAt = Number(roundData[2]); // startedAt field

      // answer == 0 means sequencer is UP, answer == 1 means DOWN
      const isUp = answer.toString() === "0";

      if (!isUp) {
        Logger.warn("Chainlink: L2 sequencer is DOWN", { chainId });
        return false;
      }

      // Check grace period
      const currentTime = Math.floor(Date.now() / 1000);
      const timeSinceUp = currentTime - startedAt;

      if (timeSinceUp < SEQUENCER_GRACE_PERIOD) {
        Logger.warn("Chainlink: L2 sequencer within grace period", {
          chainId,
          timeSinceUp,
          gracePeriod: SEQUENCER_GRACE_PERIOD,
        });
        return false;
      }

      return true;
    } catch (error) {
      Logger.error("Chainlink: Failed to check sequencer uptime", {
        chainId,
        error,
      });
      // On error, assume sequencer is up to avoid blocking all price feeds
      return true;
    }
  }

  /**
   * Read price from a Chainlink aggregator contract
   */
  private async readPriceFeed(
    feedConfig: PriceFeedConfig,
    provider: Provider,
  ): Promise<ChainlinkPriceData> {
    const feed = new ethers.Contract(
      feedConfig.address,
      AGGREGATOR_V3_ABI,
      provider,
    );

    const [roundData, decimals] = await Promise.all([
      feed.latestRoundData(),
      feed.decimals(),
    ]);

    const answer = roundData[1]; // answer field (int256)
    const updatedAt = Number(roundData[3]); // updatedAt field

    // Validate price is positive
    if (answer <= 0n) {
      throw new Error("Invalid price: non-positive value");
    }

    // Check for stale data
    const currentTime = Math.floor(Date.now() / 1000);
    const age = currentTime - updatedAt;
    const isStale = age > feedConfig.heartbeat * 1.5; // Allow 50% buffer

    if (isStale) {
      Logger.warn("Chainlink: Price data is stale", {
        description: feedConfig.description,
        age,
        heartbeat: feedConfig.heartbeat,
      });
    }

    // Convert to number with proper decimal handling
    const price = Number(ethers.formatUnits(answer, decimals));

    return {
      price,
      symbol: feedConfig.description.split(" / ")[0],
      updatedAt,
      isValid: !isStale,
    };
  }

  /**
   * Get price for a token on a specific chain
   * @param chainId - Chain ID to read from
   * @param tokenSymbol - Token symbol (e.g., "ETH", "USDC")
   * @param provider - Optional provider to use (falls back to default RPC)
   * @returns Price data or null if not available
   */
  async getPrice(
    chainId: ChainId | number,
    tokenSymbol: string,
    provider?: Provider,
  ): Promise<ChainlinkPriceData | null> {
    const cacheKey = `${chainId}_${tokenSymbol}`;

    // Check cache
    const cached = this.priceCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.data;
    }

    // Get feed config
    const chainFeeds = CHAINLINK_FEEDS[chainId as ChainId];
    if (!chainFeeds) {
      Logger.warn("Chainlink: No feeds configured for chain", { chainId });
      return null;
    }

    const feedConfig = chainFeeds[tokenSymbol.toUpperCase()];
    if (
      !feedConfig ||
      feedConfig.address === "0x0000000000000000000000000000000000000000"
    ) {
      Logger.warn("Chainlink: No feed for token", { chainId, tokenSymbol });
      return null;
    }

    try {
      const activeProvider = provider || this.getProvider(chainId as ChainId);

      // Check sequencer uptime for L2 chains
      const sequencerOk = await this.checkSequencerUptime(
        chainId as ChainId,
        activeProvider,
      );

      if (!sequencerOk) {
        // Return cached data if available, marked as potentially stale
        if (cached) {
          return { ...cached.data, isValid: false };
        }
        return null;
      }

      // Read price from contract
      const priceData = await this.readPriceFeed(feedConfig, activeProvider);

      // Update cache
      this.priceCache.set(cacheKey, {
        data: priceData,
        fetchedAt: Date.now(),
      });

      Logger.info("Chainlink: Price fetched", {
        symbol: tokenSymbol,
        price: priceData.price,
        chainId,
      });

      return priceData;
    } catch (error) {
      Logger.error("Chainlink: Failed to fetch price", {
        chainId,
        tokenSymbol,
        error,
      });

      // Return stale cached data on error
      if (cached) {
        return { ...cached.data, isValid: false };
      }

      return null;
    }
  }

  /**
   * Get prices for multiple tokens
   * @param chainId - Chain ID
   * @param tokenSymbols - Array of token symbols
   * @param provider - Optional provider
   * @returns Map of symbol to price data
   */
  async getPrices(
    chainId: ChainId | number,
    tokenSymbols: string[],
    provider?: Provider,
  ): Promise<Map<string, ChainlinkPriceData>> {
    const results = new Map<string, ChainlinkPriceData>();

    // Fetch all prices in parallel
    const promises = tokenSymbols.map(async (symbol) => {
      const data = await this.getPrice(chainId, symbol, provider);
      if (data) {
        results.set(symbol, data);
      }
    });

    await Promise.all(promises);

    return results;
  }

  /**
   * Get price by CoinGecko ID (for compatibility with existing code)
   * @param chainId - Chain ID
   * @param coingeckoId - CoinGecko token ID (e.g., "ethereum", "usd-coin")
   * @param provider - Optional provider
   * @returns Price in USD or null
   */
  async getPriceByCoingeckoId(
    chainId: ChainId | number,
    coingeckoId: string,
    provider?: Provider,
  ): Promise<number | null> {
    const symbol = COINGECKO_TO_SYMBOL[coingeckoId];
    if (!symbol) {
      Logger.warn("Chainlink: Unknown CoinGecko ID", { coingeckoId });
      return null;
    }

    const data = await this.getPrice(chainId, symbol, provider);
    return data?.price ?? null;
  }

  /**
   * Get prices for multiple tokens by CoinGecko IDs
   * @param chainId - Chain ID
   * @param coingeckoIds - Array of CoinGecko token IDs
   * @param provider - Optional provider
   * @returns Record of coingeckoId to USD price
   */
  async getPricesByCoingeckoIds(
    chainId: ChainId | number,
    coingeckoIds: string[],
    provider?: Provider,
  ): Promise<Record<string, number>> {
    const results: Record<string, number> = {};

    const promises = coingeckoIds.map(async (id) => {
      const price = await this.getPriceByCoingeckoId(chainId, id, provider);
      if (price !== null) {
        results[id] = price;
      }
    });

    await Promise.all(promises);

    return results;
  }

  /**
   * Clear the price cache
   */
  clearCache(): void {
    this.priceCache.clear();
    Logger.info("Chainlink: Cache cleared");
  }
}

// Export singleton instance
export const chainlinkPriceFeedService = new ChainlinkPriceFeedService();
