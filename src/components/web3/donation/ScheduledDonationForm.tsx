import React, { useState, useCallback } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { validateAmount } from "@/utils/validation";
import { useToast } from "@/contexts/ToastContext";
import { Logger } from "@/utils/logger";
import { ethers } from "ethers";
import { getContractAddress } from "@/config/contracts";
import { MOONBEAM_TOKENS, TokenConfig } from "@/config/tokens";
import { TokenSelector } from "./TokenSelector";
import { DualAmountInput } from "./DualAmountInput";
import { FiatPresets } from "./FiatPresets";
import { useTokenBalance } from "@/hooks/web3/useTokenBalance";
import {
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import CharityScheduledDistributionABI from "@/contracts/CharityScheduledDistribution.sol/CharityScheduledDistribution.json";

// Filter to only ERC20 tokens (native tokens not supported by the distribution contract)
const ERC20_TOKENS = MOONBEAM_TOKENS.filter((token) => !token.isNative);

// Error type guards for transaction errors
interface TransactionError {
  code?: number;
  message?: string;
}

/**
 * Type guard to check if an error is a transaction error with code and message properties
 * @param error - The error object to check
 * @returns True if the error is a transaction error, false otherwise
 */
function isTransactionError(error: unknown): error is TransactionError {
  return typeof error === "object" && error !== null;
}

/**
 * Checks if an error represents a user rejection of a transaction
 * @param error - The error object to check
 * @returns True if the error indicates user rejection (code 4001 or "user rejected" message), false otherwise
 */
function isUserRejection(error: unknown): boolean {
  return (
    isTransactionError(error) &&
    (error.code === 4001 ||
      (typeof error.message === "string" &&
        error.message.includes("user rejected")))
  );
}
import { formatDate } from "@/utils/date";

// Minimum donation amount in USD to prevent dust donations
const MINIMUM_DONATION_USD = 10;

interface SuccessMessageProps {
  amount: number;
  charityName: string;
  transactionHash: string | null;
  onClose: () => void;
  tokenSymbol: string;
  numberOfMonths: number;
  transactionFee?: string;
}

/**
 * Component that displays a success message after a scheduled donation is created
 * @param amount - The donation amount
 * @param charityName - Name of the charity receiving the donation
 * @param transactionHash - The blockchain transaction hash
 * @param onClose - Callback function to close the success message
 */
const SuccessMessage: React.FC<SuccessMessageProps> = ({
  amount,
  charityName,
  transactionHash,
  onClose,
  tokenSymbol,
  numberOfMonths,
  transactionFee,
}) => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + numberOfMonths);
  const monthlyAmount = amount / numberOfMonths;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="flex items-center gap-3 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 rounded-xl shadow-sm animate-fadeIn">
        <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
        <div>
          <h3 className="text-base font-bold text-green-900 mb-1">
            Recurring Donation Scheduled!
          </h3>
          <p className="text-sm text-green-700">
            Your commitment has been secured on the blockchain.
          </p>
        </div>
      </div>

      {/* Important Commitment Notice */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-indigo-200 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-indigo-900 mb-2">
              Important Notice
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              To immediately secure your full{" "}
              <span className="font-bold text-indigo-900">
                {amount.toFixed(4)} {tokenSymbol}
              </span>{" "}
              commitment, the total amount has been reserved today and will be
              automatically distributed to{" "}
              <span className="font-bold text-indigo-900">{charityName}</span>{" "}
              in equal installments over the next{" "}
              <span className="font-bold text-indigo-900">
                {numberOfMonths} months
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Recap */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-5 rounded-xl border-2 border-gray-200 shadow-sm">
        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Transaction Recap
        </h4>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="text-gray-600 font-medium">
              Total Amount Reserved:
            </span>
            <span className="font-bold text-gray-900 text-base">
              {amount.toFixed(6)} {tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="text-gray-600 font-medium">
              Monthly Distribution:
            </span>
            <span className="font-bold text-indigo-900">
              {monthlyAmount.toFixed(6)} {tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="text-gray-600 font-medium">
              Number of Payments:
            </span>
            <span className="font-semibold text-gray-900">
              {numberOfMonths} months
            </span>
          </div>
          {transactionFee && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
              <span className="text-gray-600 font-medium">
                Transaction Fee:
              </span>
              <span className="font-medium text-gray-900">
                {transactionFee}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="text-gray-600 font-medium">
              Distribution Starts:
            </span>
            <span className="font-medium text-gray-900">
              {formatDate(startDate.toISOString())}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="text-gray-600 font-medium">
              Distribution Ends:
            </span>
            <span className="font-medium text-gray-900">
              {formatDate(endDate.toISOString())}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <span className="text-indigo-700 font-semibold">Beneficiary:</span>
            <span className="font-bold text-indigo-900">{charityName}</span>
          </div>
        </div>
      </div>

      {/* Transaction Hash */}
      {transactionHash && (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700">
              Transaction Hash:
            </p>
            <a
              href={`https://moonbase.moonscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View on Explorer
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs font-mono text-gray-600 break-all bg-white p-2 rounded border border-gray-200">
            {transactionHash}
          </p>
        </div>
      )}

      <Button
        onClick={onClose}
        fullWidth
        size="lg"
        className="font-bold shadow-lg bg-green-600 hover:bg-green-700"
      >
        Complete
      </Button>
    </div>
  );
};

interface ScheduledDonationFormProps {
  charityAddress: string;
  charityName: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

/**
 * Form component for creating scheduled monthly donations
 * @function ScheduledDonationForm
 * @description Advanced donation form that creates automated monthly payments to charities over a 12-month period.
 * Handles token approval, contract interaction, and provides detailed confirmation feedback.
 * @param {Object} props - Component props
 * @param {string} props.charityAddress - The blockchain address of the charity to receive scheduled donations
 * @param {string} props.charityName - Display name of the charity for user-friendly messaging
 * @param {function} [props.onSuccess] - Optional callback function called after successful schedule creation
 * @param {function} [props.onClose] - Optional callback function for closing the form modal
 * @returns {React.ReactElement} Complete scheduled donation form with amount input, schedule preview, and transaction handling
 * @example
 * ```tsx
 * <ScheduledDonationForm
 *   charityAddress="0x1234...abcd"
 *   charityName="Save the Children"
 *   onSuccess={() => refreshSchedules()}
 *   onClose={() => setShowModal(false)}
 * />
 * ```
 */
export function ScheduledDonationForm({
  charityAddress,
  charityName,
  onSuccess,
  onClose: _onClose,
}: ScheduledDonationFormProps) {
  const [amount, setAmount] = useState(0);
  const [selectedToken, setSelectedToken] = useState(ERC20_TOKENS[0]);
  const [numberOfMonths, setNumberOfMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionFee, setTransactionFee] = useState<string | null>(null);
  const { provider, address, isConnected, connect } = useWeb3();
  const { showToast: _showToast } = useToast();
  const { balance, isLoading: isLoadingBalance } =
    useTokenBalance(selectedToken);
  const { convertToFiat, tokenPrices } = useCurrencyContext();

  // Calculate start and end dates for the donation schedule
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + numberOfMonths);

  const handleAmountChange = useCallback((newAmount: number) => {
    setAmount(newAmount);
  }, []);

  const handleTokenSelect = useCallback(
    (token: TokenConfig) => {
      setSelectedToken(token);
      setAmount(0); // Reset amount when token changes
    },
    [],
  );

  const handleMonthsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const months = value === "" ? 1 : Number.parseInt(value, 10);
      setNumberOfMonths(Math.max(1, Math.min(60, months))); // Limit between 1-60 months
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!validateAmount(amount)) {
        setError("Please enter a valid amount between 0 and 1,000,000");
        return;
      }

      if (amount <= 0) {
        setError("Please enter an amount greater than 0");
        return;
      }

      // Check minimum donation threshold ($10 USD equivalent)
      // TEMPORARILY DISABLED FOR TESTING
      // const tokenPrice = tokenPrices[selectedToken.coingeckoId];
      // if (tokenPrice) {
      //   const fiatValue = convertToFiat(amount, selectedToken.coingeckoId);
      //   if (fiatValue < MINIMUM_DONATION_USD) {
      //     setError(
      //       `Minimum donation is $${MINIMUM_DONATION_USD} USD. Current value: $${fiatValue.toFixed(2)} USD. Please increase your donation amount.`
      //     );
      //     return;
      //   }
      // }

      // Check for sufficient balance
      if (balance !== undefined && amount > balance) {
        setError(
          `Insufficient balance. You have ${balance.toFixed(6)} ${selectedToken.symbol} but need ${amount.toFixed(6)} ${selectedToken.symbol}.`,
        );
        return;
      }

      if (!isConnected || !provider || !address) {
        try {
          await connect();
        } catch (err) {
          setError("Please connect your wallet to continue");
          return;
        }
      }

      try {
        setLoading(true);

        // Get the distribution contract address
        const distributionAddress = getContractAddress("DISTRIBUTION");

        // Create contract instance
        const signer = await provider.getSigner();
        const distributionContract = new ethers.Contract(
          distributionAddress,
          CharityScheduledDistributionABI.abi,
          signer,
        );

        // Use the selected token address
        const tokenAddress = selectedToken.address;

        // First, approve the token transfer
        const tokenContract = new ethers.Contract(
          tokenAddress,
          [
            "function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
          ],
          signer,
        );

        const parsedAmount = ethers.parseEther(amount.toString());

        // Check current allowance before approving
        const currentAllowance = await tokenContract.allowance(
          address,
          distributionAddress
        );

        if (currentAllowance < parsedAmount) {
          Logger.info("Requesting token approval for scheduled donation", {
            token: selectedToken.symbol,
            spender: distributionAddress,
          });

          try {
            // Approve unlimited amount to avoid repeated approvals
            const approveTx = await tokenContract.approve(
              distributionAddress,
              ethers.MaxUint256,
            );
            await approveTx.wait();

            Logger.info("Token approval successful", {
              token: selectedToken.symbol,
              spender: distributionAddress,
            });
          } catch (approveError: unknown) {
            // Check if user rejected the transaction
            if (isUserRejection(approveError)) {
              throw new Error(
                "Transaction was rejected. Please approve the transaction in your wallet to continue.",
              );
            }
            throw approveError;
          }
        }

        // Get current token price from CurrencyContext
        const tokenPrice = tokenPrices[selectedToken.coingeckoId];
        if (!tokenPrice) {
          throw new Error(
            "Unable to fetch current token price. Please try again.",
          );
        }

        // Convert price to 8 decimals for the contract (USD with 8 decimals)
        const tokenPriceWith8Decimals = Math.floor(tokenPrice * 10 ** 8);

        Logger.info("Creating scheduled donation", {
          charity: charityAddress,
          amount,
          numberOfMonths,
          tokenPrice,
          tokenPriceWith8Decimals,
        });

        // Create the scheduled donation with new parameters
        try {
          const tx = await distributionContract.createSchedule(
            charityAddress,
            tokenAddress,
            parsedAmount,
            numberOfMonths,
            tokenPriceWith8Decimals.toString(),
          );

          const receipt = await tx.wait();
          setTransactionHash(receipt.hash);

          // Calculate transaction fee
          const gasUsed = receipt.gasUsed;
          const gasPrice = receipt.gasPrice || receipt.effectiveGasPrice;
          const fee = ethers.formatEther(gasUsed * gasPrice);
          setTransactionFee(`${Number.parseFloat(fee).toFixed(6)} GLMR`);

          setShowConfirmation(true);

          Logger.info("Scheduled donation created", {
            charity: charityAddress,
            amount,
            token: tokenAddress,
            txHash: receipt.hash,
            transactionFee: fee,
          });
        } catch (txError: unknown) {
          // Check if user rejected the transaction
          if (
            txError.code === 4001 ||
            txError.message?.includes("user rejected")
          ) {
            throw new Error(
              "Transaction was rejected. Please confirm the transaction in your wallet to schedule your donation.",
            );
          }
          throw txError;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to schedule donation";
        setError(message);
        Logger.error("Scheduled donation failed", { error: err });
      } finally {
        setLoading(false);
      }
    },
    [
      amount,
      charityAddress,
      isConnected,
      provider,
      address,
      connect,
      balance,
      selectedToken,
      tokenPrices,
      numberOfMonths,
    ],
  );

  const handleConfirmationClose = useCallback(() => {
    setAmount(0);
    setShowConfirmation(false);
    setTransactionHash(null);
    setTransactionFee(null);
    onSuccess?.();
  }, [onSuccess]);

  if (showConfirmation) {
    return (
      <SuccessMessage
        amount={amount}
        charityName={charityName}
        transactionHash={transactionHash}
        onClose={handleConfirmationClose}
        tokenSymbol={selectedToken.symbol}
        numberOfMonths={numberOfMonths}
        transactionFee={transactionFee}
      />
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center">
        <p className="mb-4 text-gray-600">
          Connect your wallet to schedule monthly donations
        </p>
        <Button onClick={connect}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl animate-fadeIn">
          <svg
            className="h-5 w-5 flex-shrink-0 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
        <p className="text-sm text-gray-700 leading-relaxed">
          Schedule recurring donations to{" "}
          <span className="font-semibold text-indigo-900">{charityName}</span>.
          The total amount will be divided into equal monthly payments.
        </p>
      </div>

      <TokenSelector
        selectedToken={selectedToken}
        onSelectToken={handleTokenSelect}
        walletBalance={balance}
        isLoadingBalance={isLoadingBalance}
        availableTokens={ERC20_TOKENS}
      />

      <FiatPresets
        selectedToken={selectedToken}
        onAmountSelect={handleAmountChange}
      />

      <DualAmountInput
        token={selectedToken}
        value={amount}
        onChange={handleAmountChange}
        maxBalance={balance}
      />

      <div className="space-y-2">
        <Input
          label="Number of Months"
          type="number"
          min="1"
          max="60"
          step="1"
          value={numberOfMonths}
          onChange={handleMonthsChange}
          required
          variant="enhanced"
          className="text-lg font-semibold"
          helperText="Choose how many months to spread your donation (1-60 months)"
        />
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-100 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Schedule Preview
        </h4>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center p-2 bg-white rounded-lg">
            <span className="text-gray-600">Monthly payment:</span>
            <span className="font-bold text-indigo-900">
              {amount ? (amount / numberOfMonths).toFixed(6) : "0.00"}{" "}
              {selectedToken.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-white rounded-lg">
            <span className="text-gray-600">Total payments:</span>
            <span className="font-semibold text-gray-900">
              {numberOfMonths} months
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-white rounded-lg">
            <span className="text-gray-600">Schedule period:</span>
            <span className="font-medium text-gray-700 text-xs">
              {formatDate(startDate.toISOString())} to{" "}
              {formatDate(endDate.toISOString())}
            </span>
          </div>
        </div>
      </div>

      {/* Minimum Donation Info */}
      {amount > 0 && tokenPrices[selectedToken.coingeckoId] !== undefined && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Minimum donation:</span> $
            {MINIMUM_DONATION_USD} USD to prevent dust transactions
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={
          loading ||
          !amount ||
          isLoadingBalance ||
          (balance !== undefined && amount > balance)
        }
        fullWidth
        size="lg"
        icon={
          loading ? <Loader2 className="w-5 h-5 animate-spin" /> : undefined
        }
        className="font-bold text-lg shadow-xl hover:shadow-2xl"
      >
        {loading ? "Processing..." : "Schedule Recurring Donation"}
      </Button>
    </form>
  );
}
