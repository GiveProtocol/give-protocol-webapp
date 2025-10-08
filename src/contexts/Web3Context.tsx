import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { ethers } from "ethers";
import { Logger } from "@/utils/logger";
import { CHAIN_IDS } from "@/config/contracts";

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

interface Web3ContextType {
  provider: ethers.Provider | null;
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

const MOONBASE_CHAIN_INFO = {
  chainId: `0x${CHAIN_IDS.MOONBASE.toString(16)}`,
  chainName: "Moonbase Alpha",
  nativeCurrency: {
    name: "DEV",
    symbol: "DEV",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
  blockExplorerUrls: ["https://moonbase.moonscan.io/"],
};

/**
 * Web3 provider component that manages blockchain wallet connections and state
 * Handles MetaMask/wallet connections, chain switching, and account management
 * @param children - React components to wrap with Web3 context
 */
export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentWalletProvider, setCurrentWalletProvider] = useState<
    unknown | null
  >(null);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAddress(null);
      setProvider(null);
      setChainId(null);
      Logger.info("Wallet disconnected");
    } else {
      setAddress(accounts[0]);
      Logger.info("Account changed", { address: accounts[0] });
    }
  }, []);

  // Handle chain changes
  const handleChainChanged = useCallback((chainIdHex: string) => {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);
    Logger.info("Chain changed", { chainId: newChainId });

    // Reload the page when chain changes to ensure all state is fresh
    window.location.reload();
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
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();

            setProvider(provider);
            setAddress(accounts[0]);
            setChainId(Number(network.chainId));
            Logger.info("Restored existing connection", {
              address: accounts[0],
              chainId: network.chainId,
            });
          }
        } catch (err: unknown) {
          // Clear any existing connection state
          setProvider(null);
          setAddress(null);
          setChainId(null);

          // Handle unauthorized error specifically
          if (hasErrorMessage(err, "has not been authorized")) {
            const error = new Error(
              'Wallet connection needs authorization. Please click "Connect" to continue.',
            );
            setError(error);
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
    const walletProvider = currentWalletProvider || window.ethereum;
    if (!walletProvider || typeof walletProvider.on !== "function") return;

    const handleDisconnect = () => {
      setProvider(null);
      setAddress(null);
      setChainId(null);
      setCurrentWalletProvider(null);
    };

    walletProvider.on("accountsChanged", handleAccountsChanged);
    walletProvider.on("chainChanged", handleChainChanged);
    walletProvider.on("disconnect", handleDisconnect);

    // deepsource-disable JS-0045
    return () => {
      // React cleanup functions return void/undefined by design
      walletProvider.removeListener?.("accountsChanged", handleAccountsChanged);
      walletProvider.removeListener?.("chainChanged", handleChainChanged);
      walletProvider.removeListener?.("disconnect", handleDisconnect);
    };
    // deepsource-enable JS-0045
  }, [handleAccountsChanged, handleChainChanged, currentWalletProvider]);

  const switchChain = useCallback(
    async (targetChainId: number) => {
      const walletProvider = currentWalletProvider || window.ethereum;
      if (!walletProvider) {
        throw new Error("No wallet provider found");
      }

      try {
        await walletProvider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
        Logger.info("Switched network", { chainId: targetChainId });
      } catch (error: unknown) {
        // If the chain hasn't been added to wallet
        if (hasErrorCode(error, 4902)) {
          try {
            await walletProvider.request({
              method: "wallet_addEthereumChain",
              params: [MOONBASE_CHAIN_INFO],
            });
            Logger.info("Added Moonbase Alpha network");
          } catch (addError) {
            Logger.error("Failed to add network", { error: addError });
            throw new Error("Failed to add Moonbase Alpha network");
          }
        } else {
          Logger.error("Failed to switch network", { error });
          throw error;
        }
      }
    },
    [currentWalletProvider],
  );

  const connect = useCallback(
    async (_walletProvider?: unknown) => {
      // Use provided wallet provider or fallback to window.ethereum
      const walletProvider = _walletProvider || window.ethereum;

      if (!walletProvider) {
        const error = new Error(
          "No wallet provider found. Please install a wallet extension.",
        );
        Logger.error("Wallet provider not found", { error });
        setError(error);
        throw error;
      }

      try {
        setIsConnecting(true);
        setError(null);

        // Request account access
        const accounts = await walletProvider.request({
          method: "eth_requestAccounts",
        });

        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found");
        }

        // Create Web3 provider
        const provider = new ethers.BrowserProvider(walletProvider);

        // Get connected chain ID
        const network = await provider.getNetwork();
        const currentChainId = Number(network.chainId);

        // Set provider first so it's available for chain switching
        setProvider(provider);
        setCurrentWalletProvider(walletProvider);

        // Switch to Moonbase Alpha if on wrong network
        if (currentChainId !== CHAIN_IDS.MOONBASE) {
          try {
            await switchChain(CHAIN_IDS.MOONBASE);
          } catch (switchError: unknown) {
            // If user rejected the switch, throw error
            if (hasErrorCode(switchError, 4001)) {
              throw new Error("Please switch to Moonbase Alpha (TestNet)");
            }
            // For other errors, log warning but continue
            Logger.warn("Failed to switch to Moonbase Alpha", {
              error: switchError,
            });
            return;
          }
        }

        // Get chain ID again in case it changed
        const finalNetwork = await provider.getNetwork();
        setChainId(Number(finalNetwork.chainId));

        // Set connected account
        setAddress(accounts[0]);

        Logger.info("Wallet connected successfully", {
          address: accounts[0],
          chainId: Number(finalNetwork.chainId),
        });
      } catch (err: unknown) {
        // Handle user rejected request
        if (hasErrorCode(err, 4001)) {
          const error = new Error("User rejected wallet connection");
          setError(error);
          throw error;
        }

        // Handle other errors
        const message = err?.message || "Failed to connect wallet";
        const error = new Error(message);
        Logger.error("Wallet connection failed", { error });
        setError(error);
        throw error;
      } finally {
        setIsConnecting(false);
      }
    },
    [switchChain],
  );

  const disconnect = useCallback(async () => {
    try {
      // Clear state immediately
      setProvider(null);
      setAddress(null);
      setChainId(null);
      setError(null);
      setCurrentWalletProvider(null);

      // Most wallets don't have a disconnect method, but we can try various approaches
      if (window.ethereum) {
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

  return (
    <Web3Context.Provider
      value={{
        provider,
        address,
        chainId,
        isConnected: Boolean(address),
        isConnecting,
        connect,
        disconnect,
        error,
        switchChain,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * Hook to access Web3 context for blockchain interactions
 * Provides wallet connection state, provider access, and connection methods
 * @returns Web3ContextType containing wallet state and blockchain interaction methods
 * @throws Error if used outside of Web3Provider
 */
export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
