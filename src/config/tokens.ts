/**
 * Token configuration for Moonbeam-based donations
 * Defines supported tokens, their metadata, and contract addresses
 */

export interface TokenConfig {
  /** Token symbol (e.g., "GLMR", "USDC") */
  symbol: string;
  /** Full token name */
  name: string;
  /** Smart contract address on Moonbeam */
  address: string;
  /** Number of decimal places */
  decimals: number;
  /** CoinGecko API ID for price fetching */
  coingeckoId: string;
  /** URL to token icon/logo */
  icon: string;
  /** Whether this is the native token */
  isNative: boolean;
}

export interface FiatCurrency {
  /** Currency code (e.g., "USD", "EUR") */
  code: string;
  /** Currency name */
  name: string;
  /** Currency symbol */
  symbol: string;
  /** CoinGecko API ID (e.g., "usd", "eur") */
  coingeckoId: string;
}

/**
 * Supported tokens on Moonbeam Alpha testnet
 * These represent the tokens available for donations
 */
export const MOONBEAM_TOKENS: TokenConfig[] = [
  {
    symbol: "DEV",
    name: "Moonbase Alpha DEV",
    address: "0x0000000000000000000000000000000000000000", // Native token
    decimals: 18,
    coingeckoId: "moonbeam", // Using GLMR price as proxy since DEV is testnet token
    icon: "https://assets.coingecko.com/coins/images/22459/small/glmr.png",
    isNative: true,
  },
  {
    symbol: "GLMR",
    name: "Glimmer",
    address: "0x0000000000000000000000000000000000000000", // Native token (for mainnet)
    decimals: 18,
    coingeckoId: "moonbeam",
    icon: "https://assets.coingecko.com/coins/images/22459/small/glmr.png",
    isNative: true,
  },
  {
    symbol: "WGLMR",
    name: "Wrapped GLMR",
    address: "0xAcc15dC74880C9944775448304B263D191c6077F", // Moonbase Alpha WGLMR
    decimals: 18,
    coingeckoId: "wrapped-moonbeam",
    icon: "https://assets.coingecko.com/coins/images/22459/small/glmr.png",
    isNative: false,
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    address: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080", // xcDOT on Moonbeam
    decimals: 10,
    coingeckoId: "polkadot",
    icon: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
    isNative: false,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x931715FEE2d06333043d11F658C8CE934aC61D0c", // Multichain USDC on Moonbeam
    decimals: 6,
    coingeckoId: "usd-coin",
    icon: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    isNative: false,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xc30E9cA94CF52f3Bf5692aaCF81353a27052c46f", // Multichain USDT on Moonbeam
    decimals: 6,
    coingeckoId: "tether",
    icon: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    isNative: false,
  },
];

/**
 * Supported fiat currencies for display
 * Matches the currencies defined in SettingsContext
 */
export const SUPPORTED_CURRENCIES: FiatCurrency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", coingeckoId: "usd" },
  { code: "EUR", name: "Euro", symbol: "€", coingeckoId: "eur" },
  { code: "GBP", name: "British Pound", symbol: "£", coingeckoId: "gbp" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", coingeckoId: "cad" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", coingeckoId: "aud" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", coingeckoId: "cny" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", coingeckoId: "jpy" },
  { code: "KRW", name: "Korean Won", symbol: "₩", coingeckoId: "krw" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", coingeckoId: "aed" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", coingeckoId: "chf" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", coingeckoId: "inr" },
  { code: "MXP", name: "Mexican Peso", symbol: "Mex$", coingeckoId: "mxn" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪", coingeckoId: "ils" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", coingeckoId: "ngn" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", coingeckoId: "hkd" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", coingeckoId: "pkr" },
];

/**
 * Get token configuration by symbol
 * @param symbol Token symbol to find
 * @returns Token configuration or undefined if not found
 */
export function getTokenBySymbol(symbol: string): TokenConfig | undefined {
  return MOONBEAM_TOKENS.find(
    (token) => token.symbol.toLowerCase() === symbol.toLowerCase(),
  );
}

/**
 * Get token configuration by contract address
 * @param address Token contract address
 * @returns Token configuration or undefined if not found
 */
export function getTokenByAddress(address: string): TokenConfig | undefined {
  return MOONBEAM_TOKENS.find(
    (token) => token.address.toLowerCase() === address.toLowerCase(),
  );
}

/**
 * Get fiat currency configuration by code
 * @param code Currency code (e.g., "USD")
 * @returns Fiat currency configuration or undefined if not found
 */
export function getCurrencyByCode(code: string): FiatCurrency | undefined {
  return SUPPORTED_CURRENCIES.find(
    (currency) => currency.code.toLowerCase() === code.toLowerCase(),
  );
}
