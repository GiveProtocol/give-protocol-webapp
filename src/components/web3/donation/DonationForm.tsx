import React, { useState, useCallback } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/Button";
import { validateAmount } from "@/utils/validation";
import { useDonation, DonationType } from "@/hooks/web3/useDonation";
import { Logger } from "@/utils/logger";
import { TokenSelector } from "./TokenSelector";
import { DualAmountInput } from "./DualAmountInput";
import { FiatPresets } from "./FiatPresets";
import { MOONBEAM_TOKENS } from "@/config/tokens";

interface DonationFormProps {
  charityAddress: string;
  onSuccess?: () => void;
}

/**
 * Form component for making donations to charities
 * @function DonationForm
 * @description Comprehensive donation form that supports both native GLMR and ERC20 token donations.
 * Includes wallet connection check, donation type selection, amount validation, and transaction processing.
 * @param {Object} props - Component props
 * @param {string} props.charityAddress - The blockchain address of the charity to receive the donation
 * @param {function} [props.onSuccess] - Optional callback function called after successful donation submission
 * @returns {React.ReactElement} Complete donation form with type selection, amount input, and submit functionality
 * @example
 * ```tsx
 * <DonationForm
 *   charityAddress="0x1234...abcd"
 *   onSuccess={() => refreshDonationList()}
 * />
 * ```
 */
export function DonationForm({ charityAddress, onSuccess }: DonationFormProps) {
  const [amount, setAmount] = useState(0);
  const [selectedToken, setSelectedToken] = useState(MOONBEAM_TOKENS[0]); // Default to GLMR
  const { donate, loading, error: donationError } = useDonation();
  const { isConnected, connect } = useWeb3();
  const [error, setError] = useState("");

  const handleAmountChange = useCallback((newAmount: number) => {
    setAmount(newAmount);
  }, []);

  const handleTokenSelect = useCallback((token: typeof MOONBEAM_TOKENS[0]) => {
    setSelectedToken(token);
    setAmount(0); // Reset amount when token changes
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!validateAmount(amount)) {
        setError("Please enter a valid amount between 0 and 1,000,000");
        return;
      }

      if (amount <= 0) {
        setError("Please enter an amount greater than 0");
        return;
      }

      try {
        const donationType = selectedToken.isNative
          ? DonationType._NATIVE
          : DonationType._TOKEN;

        await donate({
          charityAddress,
          amount: amount.toString(),
          type: donationType,
          _tokenAddress: selectedToken.isNative ? undefined : selectedToken.address,
        });

        setAmount(0);
        onSuccess?.();

        Logger.info("Donation submitted", {
          charity: charityAddress,
          amount,
          token: selectedToken.symbol,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to process donation",
        );
      }
    },
    [amount, charityAddress, selectedToken, donate, onSuccess],
  );

  if (!isConnected) {
    return (
      <div className="text-center">
        <p className="mb-4 text-gray-600">Connect your wallet to donate</p>
        <Button onClick={connect}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || donationError) && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md">
          {error || donationError}
        </div>
      )}

      <TokenSelector
        selectedToken={selectedToken}
        onSelectToken={handleTokenSelect}
      />

      <FiatPresets
        selectedToken={selectedToken}
        onAmountSelect={handleAmountChange}
      />

      <DualAmountInput
        token={selectedToken}
        value={amount}
        onChange={handleAmountChange}
      />

      <Button
        type="submit"
        disabled={loading || amount <= 0}
        className="w-full"
      >
        {loading ? "Processing..." : "Donate"}
      </Button>
    </form>
  );
}
