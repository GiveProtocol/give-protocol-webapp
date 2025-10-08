import React, { useState, useCallback } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { validateAmount } from "@/utils/validation";
import { useToast } from "@/contexts/ToastContext";
import { Logger } from "@/utils/logger";
import { ethers } from "ethers";
import { getContractAddress } from "@/config/contracts";
import CharityScheduledDistributionABI from "@/contracts/CharityScheduledDistribution.sol/CharityScheduledDistribution.json";

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

interface SuccessMessageProps {
  amount: string;
  charityName: string;
  transactionHash: string | null;
  onClose: () => void;
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
}) => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 12);

  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-md border border-green-200 flex items-start">
        <svg className="h-5 w-5 text-green-400 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <div>
          <h3 className="text-sm font-medium text-green-800">Monthly donation scheduled successfully!</h3>
          <p className="mt-2 text-sm text-green-700">Your donation of {amount} tokens has been scheduled.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-md border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Schedule Details:</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div><span className="font-medium">Total Amount:</span> {amount} tokens</div>
          <div><span className="font-medium">Monthly Payment:</span> {(parseFloat(amount) / 12).toFixed(2)} tokens</div>
          <div><span className="font-medium">Start Date:</span> {formatDate(startDate.toISOString())}</div>
          <div><span className="font-medium">End Date:</span> {formatDate(endDate.toISOString())}</div>
          <div><span className="font-medium">Recipient:</span> {charityName}</div>
        </div>
      </div>

      {transactionHash && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Transaction Hash:</p>
          <a
            href={`https://moonbase.moonscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-indigo-600 hover:text-indigo-800 break-all"
          >
            {transactionHash}
          </a>
        </div>
      )}

      <Button onClick={onClose} className="w-full">
        Close
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
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const { provider, address, isConnected, connect } = useWeb3();
  const { showToast: _showToast } = useToast();

  // Calculate start and end dates for the donation schedule
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 12);

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!validateAmount(parseFloat(amount))) {
        setError("Please enter a valid amount between 0 and 1,000,000");
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

        // For now, we'll use the native token (GLMR)
        // In a real implementation, you would get the token address from a dropdown
        const tokenAddress = getContractAddress("TOKEN");

        // First, approve the token transfer
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ["function approve(address spender, uint256 amount) returns (bool)"],
          signer,
        );

        const parsedAmount = ethers.parseEther(amount);

        try {
          const approveTx = await tokenContract.approve(
            distributionAddress,
            parsedAmount,
          );
          await approveTx.wait();
        } catch (approveError: unknown) {
          // Check if user rejected the transaction
          if (isUserRejection(approveError)) {
            throw new Error(
              "Transaction was rejected. Please approve the transaction in your wallet to continue.",
            );
          }
          throw approveError;
        }

        // Create the scheduled donation
        try {
          const tx = await distributionContract.createSchedule(
            charityAddress,
            tokenAddress,
            parsedAmount,
          );

          const receipt = await tx.wait();
          setTransactionHash(receipt.hash);
          setShowConfirmation(true);

          Logger.info("Scheduled donation created", {
            charity: charityAddress,
            amount,
            token: tokenAddress,
            txHash: receipt.hash,
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
    [amount, charityAddress, isConnected, provider, address, connect],
  );

  const handleConfirmationClose = useCallback(() => {
    setAmount("");
    setShowConfirmation(false);
    setTransactionHash(null);
    onSuccess?.();
  }, [onSuccess]);

  if (showConfirmation) {
    return (
      <SuccessMessage
        amount={amount}
        charityName={charityName}
        transactionHash={transactionHash}
        onClose={handleConfirmationClose}
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md">{error}</div>
      )}

      <div>
        <p className="text-sm text-gray-600 mb-4">
          Schedule a monthly donation to {charityName}. The total amount will be
          divided into 12 equal monthly payments.
        </p>
      </div>

      <Input
        label="Total Amount (for 12 months)"
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={handleAmountChange}
        required
        helperText="This amount will be divided into 12 equal monthly payments"
      />

      <div className="bg-blue-50 p-3 rounded-md mb-2">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Monthly payment:</span>{" "}
          {amount ? (parseFloat(amount) / 12).toFixed(2) : "0.00"} tokens
        </p>
        <p className="text-sm text-blue-700 mt-1">
          <span className="font-medium">Schedule period:</span>{" "}
          {formatDate(startDate.toISOString())} to{" "}
          {formatDate(endDate.toISOString())}
        </p>
      </div>

      <Button type="submit" disabled={loading || !amount} className="w-full">
        {loading ? "Processing..." : "Schedule Monthly Donation"}
      </Button>
    </form>
  );
}
