import { useState } from "react";
import { useContract } from "./useContract";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { Logger } from "@/utils/logger";
import { trackTransaction } from "@/lib/sentry";

export enum DonationType {
  _NATIVE = "native", // Prefixed with _ as currently unused
  _TOKEN = "token", // Prefixed with _ as currently unused
}

export enum PoolType {
  _DIRECT = "direct", // Prefixed with _ as currently unused
  _EQUITY = "equity", // Prefixed with _ as currently unused
}

interface DonationParams {
  charityAddress: string;
  amount: string;
  type: DonationType;
  _tokenAddress?: string; // Prefixed with _ as currently unused
  poolType?: PoolType;
}

/**
 * Donation hook for processing blockchain-based charitable donations and withdrawals
 * @function useDonation
 * @description Handles direct and equity pool donations using smart contracts on the blockchain.
 * Integrates with Sentry transaction tracking, supports native token donations, and provides
 * comprehensive error handling with withdrawal functionality for charities.
 * @returns {Object} Donation processing utilities and state
 * @returns {Function} returns.donate - Process donation: (params: DonationParams) => Promise<void>
 * @returns {Function} returns.withdraw - Process withdrawal: (amount: string) => Promise<string>
 * @returns {boolean} returns.loading - Loading state for donation/withdrawal operations
 * @returns {string | null} returns.error - Error message or null if no error
 * @example
 * ```tsx
 * const { donate, withdraw, loading, error } = useDonation();
 *
 * const handleDonation = async () => {
 *   try {
 *     await donate({
 *       charityAddress: '0x123...',
 *       amount: '0.1',
 *       type: DonationType.NATIVE,
 *       poolType: PoolType.DIRECT
 *     });
 *     console.log('Donation successful!');
 *   } catch (error) {
 *     // Error handling included in hook
 *   }
 * };
 *
 * const handleWithdrawal = async () => {
 *   try {
 *     const txHash = await withdraw('0.05');
 *     console.log('Withdrawal successful:', txHash);
 *   } catch (error) {
 *     // Error handling included in hook
 *   }
 * };
 *
 * return (
 *   <div>
 *     <button onClick={handleDonation} disabled={loading}>
 *       {loading ? 'Processing...' : 'Donate'}
 *     </button>
 *     {error && <p className="error">{error}</p>}
 *   </div>
 * );
 * ```
 */
export function useDonation() {
  const { contract } = useContract("donation");
  const { address } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const donate = async ({
    charityAddress,
    amount,
    type,
    _tokenAddress,
    poolType = PoolType._DIRECT,
  }: DonationParams) => {
    if (!contract || !address) {
      throw new Error("Contract or wallet not connected");
    }

    // Start Sentry transaction tracking
    const transaction = trackTransaction("donation", {
      amount,
      charityId: charityAddress,
      donationType: type,
      status: "started",
    });

    try {
      setLoading(true);
      setError(null);

      const parsedAmount = parseEther(amount);

      if (type === DonationType.NATIVE) {
        // For both direct and equity pool donations (currently using same method)
        if (poolType === PoolType._DIRECT || poolType === PoolType._EQUITY) {
          // In ethers v6, we need to use the contract.getFunction method
          const donateFunction = contract.getFunction("donate");
          const tx = await donateFunction(charityAddress, {
            value: parsedAmount,
          });
          await tx.wait();
        }

        Logger.info("Donation successful", {
          amount,
          charity: charityAddress,
          type: "native",
          poolType,
        });

        // Mark transaction as successful
        transaction.finish("ok");
      } else {
        // For token donations, we would need to implement this
        // based on the contract's token donation functionality
        throw new Error("Token donations not yet implemented");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process donation";
      setError(message);
      Logger.error("Donation failed", {
        error: err,
        amount,
        charity: charityAddress,
        type,
      });

      // Mark transaction as failed
      transaction.finish("error");

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount: string) => {
    if (!contract || !address) {
      throw new Error("Contract or wallet not connected");
    }

    try {
      setLoading(true);
      setError(null);

      const parsedAmount = parseEther(amount);
      const withdrawFunction = contract.getFunction("withdraw");
      const tx = await withdrawFunction(parsedAmount);
      const receipt = await tx.wait();

      Logger.info("Withdrawal successful", {
        amount,
        txHash: receipt.hash,
      });

      return receipt.hash;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process withdrawal";
      setError(message);
      Logger.error("Withdrawal failed", {
        error: err,
        amount,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    donate,
    withdraw,
    loading,
    error,
  };
}
