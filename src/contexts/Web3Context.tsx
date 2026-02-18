import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  startTransition,
} from "react";
import { ethers } from "ethers";
import { Logger } from "@/utils/logger";
import { CHAIN_CONFIGS, type ChainId } from "@/config/contracts";
import { useChain } from "./ChainContext";
import { useMultiChainContext } from "./MultiChainContext";
import type { UnifiedWalletProvider } from "@/types/wallet";

// EIP-1193 Provider interface
interface EIP1193Provider {
  request: (_args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (_event: string, _handler: (..._args: unknown[]) => void) => void;
  removeListener?: (
    _event: string,
    _handler: (..._args: unknown[]) => void,
  ) => void;
  disconnect?: () => Promise<void>;
}

/**
 * Type guard to check if a provider is EIP-1193 compliant
 * @param provider - The provider to check
 * @returns True if the provider has a request method
 */
function isEIP1193Provider(provider: unknown): provider is EIP1193Provider {
  return (
    typeof provider === "object" &&
    provider !== null &&
    typeof (provider as EIP1193Provider).request === "function"
  );
}

// Error type guards for Web3 errors
interface WalletError {
  code?: number;
  message?: string;
}

/**
 * Type guard to check if an error is a wallet error with code and message properties
 * @param error - The error object to check
 * @returns True if the error is a wallet error, false otherwise
 */
function isWalletError(error: unknown): error is WalletError {
  return typeof error === "object" && error !== null;
}

/**
 * Checks if an error has a specific error code
 * @param error - The error object to check
 * @param code - The error code to match
 * @returns True if the error has the specified code, false otherwise
 */
function hasErrorCode(error: unknown, code: number): boolean {
  return isWalletError(error) && error.code === code;
}

/**
 * Checks if an error message contains a specific substring
 * @param error - The error object to check
 * @param message - The message substring to search for
 * @returns True if the error message contains the substring, false otherwise
 */
function hasErrorMessage(error: unknown, message: string): boolean {
  return (
    isWalletError(error) &&
    typeof error.message === "string" &&
    error.message.includes(message)
  );
}

/**
 * Checks if a value is a browser event (e.g., from onClick={connect})
 * @param value - The value to check
 * @returns True if the value is an event object
 */
function isEventObject(value: unknown): boolean {
  if (value instanceof Event) return true;
  return typeof value === "object" && value !== null && "nativeEvent" in value;
}

/**
 * Builds wallet_addEthereumChain params from chain config
 * @param chainId - The chain ID to get params for
 * @returns Chain params for wallet_addEthereumChain or null if unsupported
 */
function getChainParams(chainId: ChainId) {
  const config = CHAIN_CONFIGS[chainId];
  if (!config) return null;

  return {
    chainId: `0x${chainId.toString(16)}`,
    chainName: config.name,
    nativeCurrency: config.nativeCurrency,
    rpcUrls: config.rpcUrls,
    blockExplorerUrls: config.blockExplorerUrls,
  };
}

/**
 * Attempts to switch to a specified network
 * @param walletProvider - The EIP-1193 wallet provider
 * @param chainId - The target chain ID
 * @throws Error if user rejects or switch fails
 */
async function switchToChain(
  walletProvider: EIP1193Provider,
  chainId: ChainId,
): Promise<void> {
  const chainParams = getChainParams(chainId);
  if (!chainParams) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }

  try {
    await walletProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainParams.chainId }],
    });
    Logger.info("Switched network", { chainId });
  } catch (switchError: unknown) {
    // Chain not added - try to add it
    if (hasErrorCode(switchError, 4902)) {
      await walletProvider.request({
        method: "wallet_addEthereumChain",
        params: [chainParams],
      });
      Logger.info("Added network", { chainId, name: chainParams.chainName });
      return;
    }
    // User rejected
    if (hasErrorCode(switchError, 4001)) {
      const config = CHAIN_CONFIGS[chainId];
      throw new Error(
        `Please switch to ${config?.name || "the selected network"}`,
      );
    }
    // Other errors
    Logger.error("Failed to switch network", { error: switchError, chainId });
    throw new Error("Failed to switch network. Please try again.");
  }
}

interface Web3ContextType {
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: (_walletProvider?: unknown) => Promise<void>;
  disconnect: () => Promise<void>;
  error: Error | null;
  switchChain: (_chainId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

/**
 * Web3 provider component that manages blockchain wallet connections and state
 * Handles MetaMask/wallet connections, chain switching, and account management
 * @param children - React components to wrap with Web3 context
 */
export function Web3Provider({ children }: { children: React.ReactNode }) {
  // Get selected chain from ChainContext
  const { selectedChainId } = useChain();

  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentWalletProvider, setCurrentWalletProvider] = useState<
    unknown | null
  >(null);
  // Track if a connection is in progress to prevent race conditions with polling
  const isConnectingRef = React.useRef(false);
  // Track current address for polling to avoid stale closure issues
  const addressRef = React.useRef<string | null>(null);

  // Keep refs in sync with state
  React.useEffect(() => {
    addressRef.current = address;
  }, [address]);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAddress(null);
      setProvider(null);
      setSigner(null);
      setChainId(null);
      setCurrentWalletProvider(null);
      Logger.info("Wallet disconnected via accountsChanged event");
    } else {
      setAddress(accounts[0]);
      Logger.info("Account changed", { address: accounts[0] });
    }
  }, []);

  // Handle chain changes
  const handleChainChanged = useCallback((chainIdHex: string) => {
    const newChainId = Number.parseInt(chainIdHex, 16);
    setChainId(newChainId);
    Logger.info("Chain changed", { chainId: newChainId });

    // Reload the page when chain changes to ensure all state is fresh
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  // Initialize provider and check for existing connection
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            const newSigner = await newProvider.getSigner();
            const network = await newProvider.getNetwork();

            startTransition(() => {
              setProvider(newProvider);
              setSigner(newSigner);
              setAddress(accounts[0]);
              setChainId(Number(network.chainId));
            });
            Logger.info("Restored existing connection", {
              address: accounts[0],
              chainId: network.chainId,
            });
          }
        } catch (err: unknown) {
          // Clear any existing connection state
          startTransition(() => {
            setProvider(null);
            setSigner(null);
            setAddress(null);
            setChainId(null);
          });

          // Handle unauthorized error specifically
          if (hasErrorMessage(err, "has not been authorized")) {
            const error = new Error(
              'Wallet connection needs authorization. Please click "Connect" to continue.',
            );
            startTransition(() => {
              setError(error);
            });
            Logger.info("Wallet needs reauthorization");
          } else {
            Logger.error("Failed to restore connection", { error: err });
          }
        }
      }
    };

    initProvider();
  }, []);

  // Set up event listeners
  useEffect(() => {
    const walletProvider = currentWalletProvider || (typeof window !== "undefined" ? window.ethereum : null);
    if (!walletProvider || typeof walletProvider.on !== "function") return;

    const handleDisconnect = () => {
      setProvider(null);
      setSigner(null);
      setAddress(null);
      setChainId(null);
      setCurrentWalletProvider(null);
    };

    walletProvider.on("accountsChanged", handleAccountsChanged);
    walletProvider.on("chainChanged", handleChainChanged);
    walletProvider.on("disconnect", handleDisconnect);

    // React cleanup functions return void/undefined by design
    // eslint-disable-next-line consistent-return
    return () => {
      walletProvider.removeListener?.("accountsChanged", handleAccountsChanged);
      walletProvider.removeListener?.("chainChanged", handleChainChanged);
      walletProvider.removeListener?.("disconnect", handleDisconnect);
    };
  }, [handleAccountsChanged, handleChainChanged, currentWalletProvider]);

  // Poll for account changes as a fallback (some wallets don't fire events reliably)
  useEffect(() => {
    // Only poll if we think we're connected
    if (!address) {
      return undefined;
    }

    const checkConnection = async () => {
      // Skip polling while a connection is in progress to avoid race conditions
      if (isConnectingRef.current) {
        return;
      }

      const walletProvider = currentWalletProvider || (typeof window !== "undefined" ? window.ethereum : null);
      if (!walletProvider || typeof walletProvider.request !== "function")
        return;

      try {
        const accounts = await walletProvider.request({
          method: "eth_accounts",
        });
        // Use ref to get current address value, avoiding stale closure
        if (accounts.length === 0 && addressRef.current) {
          // Wallet was disconnected externally
          Logger.info("Wallet disconnected (detected via polling)");
          setAddress(null);
          setProvider(null);
          setSigner(null);
          setChainId(null);
          setCurrentWalletProvider(null);
        }
      } catch (err) {
        // Ignore errors during polling
        Logger.warn("Error polling wallet connection", { error: err });
      }
    };

    // Check every 2 seconds
    const intervalId = setInterval(checkConnection, 2000);

    return () => clearInterval(intervalId);
  }, [address, currentWalletProvider]);

  const switchChain = useCallback(
    async (targetChainId: number) => {
      const walletProvider = currentWalletProvider || (typeof window !== "undefined" ? window.ethereum : null);
      if (!walletProvider) {
        throw new Error("No wallet provider found");
      }

      if (!isEIP1193Provider(walletProvider)) {
        throw new Error("Invalid wallet provider");
      }

      await switchToChain(walletProvider, targetChainId as ChainId);
    },
    [currentWalletProvider],
  );

  const connect = useCallback(
    async (_walletProvider?: unknown) => {
      // Resolve wallet provider (ignore events from onClick={connect})
      const defaultProvider = typeof window !== "undefined" ? window.ethereum : null;
      const walletProvider = isEventObject(_walletProvider)
        ? defaultProvider
        : _walletProvider || defaultProvider;

      if (!walletProvider) {
        const error = new Error(
          "No wallet provider found. Please install a wallet extension.",
        );
        Logger.error("Wallet provider not found", { error });
        setError(error);
        throw error;
      }

      if (!isEIP1193Provider(walletProvider)) {
        const error = new Error(
          "Wallet provider is not EIP-1193 compliant. Please try refreshing the page.",
        );
        Logger.error("Invalid wallet provider", {
          hasRequest: typeof (walletProvider as { request?: unknown }).request,
          providerType: typeof walletProvider,
        });
        setError(error);
        throw error;
      }

      try {
        setIsConnecting(true);
        isConnectingRef.current = true;
        setError(null);

        // Request account access
        const accounts = (await walletProvider.request({
          method: "eth_requestAccounts",
        })) as string[];

        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found");
        }

        // Check if we need to switch networks
        const initialProvider = new ethers.BrowserProvider(walletProvider);
        const initialNetwork = await initialProvider.getNetwork();
        const currentChainId = Number(initialNetwork.chainId);

        // Switch to selected chain if on wrong network
        if (currentChainId !== selectedChainId) {
          await switchToChain(walletProvider, selectedChainId);
        }

        // Create provider AFTER chain switch is complete
        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const finalNetwork = await provider.getNetwork();
        const finalChainId = Number(finalNetwork.chainId);

        // Set all state atomically after all operations succeed
        setProvider(provider);
        setSigner(signer);
        setCurrentWalletProvider(walletProvider);
        setChainId(finalChainId);
        setAddress(accounts[0]);

        Logger.info("Wallet connected successfully", {
          address: accounts[0],
          chainId: finalChainId,
        });
      } catch (err: unknown) {
        // Clear any partial state on error
        setProvider(null);
        setSigner(null);
        setCurrentWalletProvider(null);
        setChainId(null);
        setAddress(null);

        // Handle user rejected request
        if (hasErrorCode(err, 4001)) {
          const error = new Error("User rejected wallet connection");
          setError(error);
          throw error;
        }

        // Handle other errors
        const message =
          err instanceof Error ? err.message : "Failed to connect wallet";
        const error = new Error(message);
        Logger.error("Wallet connection failed", { error });
        setError(error);
        throw error;
      } finally {
        setIsConnecting(false);
        isConnectingRef.current = false;
      }
    },
    [selectedChainId],
  );

  const disconnect = useCallback(async () => {
    try {
      // Clear state immediately
      setProvider(null);
      setSigner(null);
      setAddress(null);
      setChainId(null);
      setError(null);
      setCurrentWalletProvider(null);

      // Most wallets don't have a disconnect method, but we can try various approaches
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Try the WalletConnect disconnect method if available
          if (typeof window.ethereum.disconnect === "function") {
            await window.ethereum.disconnect();
          }
          // Try to clear permissions (MetaMask)
          else if (typeof window.ethereum.request === "function") {
            try {
              await window.ethereum.request({
                method: "wallet_revokePermissions",
                params: [{ eth_accounts: {} }],
              });
            } catch (revokeError) {
              // Silently ignore if method doesn't exist
              Logger.info("Revoke permissions not supported", {
                error: revokeError,
              });
            }
          }
        } catch (walletError) {
          // Log but don't throw - state is already cleared
          Logger.info("Wallet-specific disconnect failed, but state cleared", {
            error: walletError,
          });
        }
      }

      Logger.info("Wallet disconnected successfully");
    } catch (err) {
      Logger.error("Error during wallet disconnect", { error: err });
      // Don't throw error - we still want to clear the state
    }
  }, []);

  const contextValue = React.useMemo(
    () => ({
      provider,
      signer,
      address,
      chainId,
      isConnected: Boolean(address),
      isConnecting,
      connect,
      disconnect,
      error,
      switchChain,
    }),
    [
      provider,
      signer,
      address,
      chainId,
      isConnecting,
      connect,
      disconnect,
      error,
      switchChain,
    ],
  );

  return (
    <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
  );
}

/**
 * Hook to access Web3 context for blockchain interactions
 * Provides wallet connection state, provider access, and connection methods
 * @returns Web3ContextType containing wallet state and blockchain interaction methods
 * @throws Error if used outside of Web3Provider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

/**
 * Bridge hook that uses MultiChainContext but provides Web3Context interface
 * Use this for new code that needs backward compatibility during migration
 * @returns Web3ContextType-compatible interface backed by MultiChainContext
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useWeb3MultiChain() {
  const multiChain = useMultiChainContext();

  // Only get EVM account
  const evmAccount = multiChain.accounts.find((a) => a.chainType === "evm");
  const chainId =
    evmAccount && typeof evmAccount.chainId === "number"
      ? evmAccount.chainId
      : null;

  // Create ethers provider from the unified wallet if available
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const setupEthers = async () => {
      if (!multiChain.wallet?.providers.evm) {
        setProvider(null);
        setSigner(null);
        return;
      }

      try {
        const evmProvider = multiChain.wallet.providers.evm;
        if (isEIP1193Provider(evmProvider)) {
          const ethersProvider = new ethers.BrowserProvider(
            evmProvider as ethers.Eip1193Provider
          );
          const ethersSigner = await ethersProvider.getSigner();
          setProvider(ethersProvider);
          setSigner(ethersSigner);
        }
      } catch (error) {
        Logger.error("Failed to setup ethers provider", { error });
        setProvider(null);
        setSigner(null);
      }
    };

    setupEthers();
  }, [multiChain.wallet?.providers.evm]);

  const connect = useCallback(
    async (walletProvider?: unknown) => {
      // If a wallet provider is passed, wrap it in a UnifiedWalletProvider
      if (walletProvider && isEIP1193Provider(walletProvider)) {
        // Create a minimal unified provider for backward compatibility
        const unifiedProvider: UnifiedWalletProvider = {
          name: "Legacy EVM Wallet",
          icon: "wallet",
          category: "browser",
          supportedChainTypes: ["evm"],
          providers: { evm: walletProvider },
          isInstalled: () => true,
          connect: async () => {
            const accounts = (await walletProvider.request({
              method: "eth_requestAccounts",
            })) as string[];
            return accounts.map((addr) => ({
              id: `evm-legacy-${addr}`,
              address: addr,
              chainType: "evm" as const,
              chainId: chainId || 1,
              chainName: "EVM",
              source: "Legacy",
            }));
          },
          disconnect: async () => {
            // EVM wallets typically don't have disconnect
          },
          getAccounts: async () => [],
          switchChain: async (newChainId: number | string) => {
            await walletProvider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${Number(newChainId).toString(16)}` }],
            });
          },
          signTransaction: async () => "",
          signMessage: async () => "",
        };

        await multiChain.connect(unifiedProvider, "evm");
        return;
      }

      // No provider passed, throw error
      throw new Error("No wallet provider specified");
    },
    [multiChain, chainId]
  );

  const switchChain = useCallback(
    async (targetChainId: number) => {
      await multiChain.switchChain(targetChainId, "evm");
    },
    [multiChain]
  );

  return {
    provider,
    signer,
    address: evmAccount?.address ?? null,
    chainId,
    isConnected: evmAccount !== null,
    isConnecting: multiChain.isConnecting,
    connect,
    disconnect: multiChain.disconnect,
    error: multiChain.error,
    switchChain,
  };
}
