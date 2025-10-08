import React, { useState, useCallback } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { validateAmount } from "@/utils/validation";
import { useDonation, DonationType } from "@/hooks/web3/useDonation";
import { Logger } from "@/utils/logger";

interface RadioOptionProps {
  value: DonationType;
  checked: boolean;
  onChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
}

/**
 * Radio button option component for donation type selection
 * @function RadioOption
 * @description Renders a styled radio button option with label for selecting donation types (GLMR or ERC20 tokens)
 * @param {Object} props - Component props
 * @param {DonationType} props.value - The donation type value this option represents
 * @param {boolean} props.checked - Whether this option is currently selected
 * @param {function} props.onChange - Event handler for when this option is selected
 * @param {React.ReactNode} props.children - The label content to display next to the radio button
 * @returns {React.ReactElement} Labeled radio input element
 * @example
 * ```tsx
 * <RadioOption
 *   value={DonationType.NATIVE}
 *   checked={selectedType === DonationType.NATIVE}
 *   onChange={handleTypeChange}
 * >
 *   GLMR
 * </RadioOption>
 * ```
 */
function RadioOption({ value, checked, onChange, children }: RadioOptionProps) {
  return (
    <label className="inline-flex items-center">
      <input
        type="radio"
        className="form-radio text-indigo-600"
        name="donationType"
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className="ml-2">{children}</span>
    </label>
  );
}

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
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState<DonationType>(
    DonationType.NATIVE,
  );
  const [tokenAddress, setTokenAddress] = useState("");
  const { donate, loading, error: donationError } = useDonation();
  const { isConnected, connect } = useWeb3();
  const [error, setError] = useState("");

  const handleDonationTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDonationType(e.target.value as DonationType);
    },
    [],
  );

  const handleTokenAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTokenAddress(e.target.value);
    },
    [],
  );

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!validateAmount(parseFloat(amount))) {
        setError("Please enter a valid amount between 0 and 1,000,000");
        return;
      }

      try {
        await donate({
          charityAddress,
          amount,
          type: donationType,
          tokenAddress:
            donationType === DonationType.TOKEN ? tokenAddress : undefined,
        });

        setAmount("");
        onSuccess?.();

        Logger.info("Donation submitted", {
          charity: charityAddress,
          amount,
          type: donationType,
          token: tokenAddress || "GLMR",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to process donation",
        );
      }
    },
    [amount, charityAddress, donationType, tokenAddress, donate, onSuccess],
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || donationError) && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md">
          {error || donationError}
        </div>
      )}

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Donation Type
        </legend>
        <div className="flex space-x-4">
          <RadioOption
            value={DonationType.NATIVE}
            checked={donationType === DonationType.NATIVE}
            onChange={handleDonationTypeChange}
          >
            GLMR
          </RadioOption>
          <RadioOption
            value={DonationType.TOKEN}
            checked={donationType === DonationType.TOKEN}
            onChange={handleDonationTypeChange}
          >
            ERC20 Token
          </RadioOption>
        </div>
      </fieldset>

      {donationType === DonationType.TOKEN && (
        <Input
          label="Token Address"
          type="text"
          value={tokenAddress}
          onChange={handleTokenAddressChange}
          placeholder="Enter ERC20 token address"
          required
        />
      )}

      <Input
        label={`Amount (${donationType === DonationType.NATIVE ? "GLMR" : "Tokens"})`}
        type="number"
        min="0"
        step="0.000000000000000001"
        value={amount}
        onChange={handleAmountChange}
        required
      />

      <Button
        type="submit"
        disabled={
          loading ||
          !amount ||
          (donationType === DonationType.TOKEN && !tokenAddress)
        }
        className="w-full"
      >
        {loading ? "Processing..." : "Donate"}
      </Button>
    </form>
  );
}
