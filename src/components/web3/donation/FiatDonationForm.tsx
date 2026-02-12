import React, { useState, useCallback, useEffect, useId } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { useFiatDonation } from "@/hooks/web3/useFiatDonation";
import { PremiumInput } from "./PremiumInput";
import { FeeOffsetCheckbox } from "./FeeOffsetCheckbox";
import { calculateFeeOffset } from "./types/donation";
import type { DonationFrequency, HelcimPaymentResult } from "./types/donation";

interface FiatDonationFormProps {
  /** Unique ID for the charity */
  charityId: string;
  /** Display name of the charity */
  charityName: string;
  /** Amount to donate in dollars */
  amount: number;
  /** Donation frequency */
  frequency: DonationFrequency;
  /** Whether to cover processing fees */
  coverFees: boolean;
  /** Callback when cover fees changes */
  onCoverFeesChange: (_cover: boolean) => void;
  /** Callback on successful payment */
  onSuccess: (_result: HelcimPaymentResult) => void;
  /** Callback on error */
  onError: (_error: Error) => void;
}

/**
 * Card payment form with guest checkout
 * @component FiatDonationForm
 * @description Form for card payments using Helcim hosted fields.
 * Supports both one-time and monthly subscription payments.
 * @param {Object} props - Component props
 * @param {string} props.charityId - Charity identifier
 * @param {string} props.charityName - Charity display name
 * @param {number} props.amount - Donation amount in dollars
 * @param {DonationFrequency} props.frequency - Once or monthly
 * @param {boolean} props.coverFees - Whether to cover fees
 * @param {function} props.onCoverFeesChange - Fee coverage toggle callback
 * @param {function} props.onSuccess - Success callback
 * @param {function} props.onError - Error callback
 * @returns {React.ReactElement} Fiat donation form
 */
export function FiatDonationForm({
  charityId,
  charityName,
  amount,
  frequency,
  coverFees,
  onCoverFeesChange,
  onSuccess,
  onError,
}: FiatDonationFormProps): React.ReactElement {
  const formId = useId();
  const cardContainerId = `helcim-card-${formId.replace(/:/g, "")}`;
  const isMonthly = frequency === "monthly";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    processFiatPayment,
    loading,
    error: paymentError,
    initializeFields,
    updateAmount,
    fieldsReady,
    initializing,
  } = useFiatDonation();

  // Calculate final amount
  const { total: finalAmount } = calculateFeeOffset(coverFees ? amount : 0);
  const chargeAmount = coverFees ? finalAmount : amount;

  // Initialize Helcim fields when component mounts
  useEffect(() => {
    if (!fieldsReady && !initializing && amount > 0) {
      initializeFields(cardContainerId, chargeAmount, frequency);
    }
  }, [
    fieldsReady,
    initializing,
    cardContainerId,
    chargeAmount,
    initializeFields,
    amount,
    frequency,
  ]);

  // Update amount when it changes
  useEffect(() => {
    if (fieldsReady) {
      updateAmount(chargeAmount);
    }
  }, [chargeAmount, fieldsReady, updateAmount]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError("Please enter your full name");
      isValid = false;
    } else {
      setNameError("");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email is required for your receipt");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (amount <= 0) {
      setFormError("Please enter a donation amount");
      isValid = false;
    } else {
      setFormError("");
    }

    return isValid;
  }, [name, email, amount]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      if (nameError) setNameError("");
    },
    [nameError],
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      if (emailError) setEmailError("");
    },
    [emailError],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      if (!fieldsReady) {
        setFormError("Payment form is loading. Please wait.");
        return;
      }

      setIsSubmitting(true);
      setFormError("");

      try {
        const result = await processFiatPayment({
          name: name.trim(),
          email: email.trim(),
          amount: chargeAmount,
          coverFees,
          charityId,
          charityName,
          frequency,
        });

        onSuccess(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Payment failed");
        setFormError(error.message);
        onError(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      fieldsReady,
      processFiatPayment,
      name,
      email,
      chargeAmount,
      coverFees,
      charityId,
      charityName,
      frequency,
      onSuccess,
      onError,
    ],
  );

  const displayError = formError || paymentError;

  // Button text based on mode
  const getButtonText = (): string => {
    if (loading || isSubmitting) {
      return isMonthly ? "Setting up subscription..." : "Processing...";
    }
    if (isMonthly) {
      return `Start Monthly Gift – $${chargeAmount.toFixed(2)}/mo`;
    }
    return `Donate $${chargeAmount.toFixed(2)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {displayError && (
        <div
          className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl animate-fadeIn"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium">{displayError}</p>
        </div>
      )}

      {/* Subscription info banner for monthly */}
      {isMonthly && (
        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center">
            <RefreshCw
              className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Monthly Subscription
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              Your card will be charged automatically each month. Cancel
              anytime.
            </p>
          </div>
        </div>
      )}

      {/* Guest checkout info - only show for one-time */}
      {!isMonthly && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <CheckCircle2
            className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0"
            aria-hidden="true"
          />
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            No account needed. We&apos;ll email your receipt.
          </p>
        </div>
      )}

      {/* Name field */}
      <PremiumInput
        label="Full Name"
        type="text"
        value={name}
        onChange={handleNameChange}
        icon={User}
        error={nameError}
        autoComplete="name"
        required
      />

      {/* Email field */}
      <PremiumInput
        label="Email Address"
        type="email"
        value={email}
        onChange={handleEmailChange}
        icon={Mail}
        error={emailError}
        helperText={
          isMonthly
            ? "For receipts and subscription management"
            : "For your donation receipt"
        }
        autoComplete="email"
        required
      />

      {/* Fee offset checkbox */}
      <FeeOffsetCheckbox
        amount={amount}
        checked={coverFees}
        onChange={onCoverFeesChange}
        disabled={loading || isSubmitting}
      />

      {/* Helcim hosted fields container */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Card Details
        </label>
        <div
          id={cardContainerId}
          className={cn(
            "min-h-[120px] p-4 rounded-xl",
            "bg-gray-50 dark:bg-slate-800/70",
            "border-2 border-gray-200 dark:border-slate-600",
            "transition-all duration-200",
            "focus-within:bg-white dark:focus-within:bg-slate-900",
            "focus-within:border-transparent focus-within:ring-2 focus-within:ring-emerald-500",
            !fieldsReady && "flex items-center justify-center",
            paymentError &&
              !fieldsReady &&
              "border-red-300 dark:border-red-700",
          )}
        >
          {!fieldsReady && !paymentError && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">
                {initializing
                  ? "Connecting to payment processor..."
                  : "Loading secure payment form..."}
              </span>
            </div>
          )}
          {!fieldsReady && paymentError && (
            <div className="flex flex-col items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <span className="text-sm font-medium text-center">
                Payment System Offline
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Please try again later or use crypto payment
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={loading || isSubmitting || !fieldsReady || amount <= 0}
        fullWidth
        size="lg"
        icon={
          loading || isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isMonthly ? (
            <RefreshCw className="w-5 h-5" />
          ) : (
            <CreditCard className="w-5 h-5" />
          )
        }
        className={cn(
          "h-14 font-bold text-lg shadow-xl hover:shadow-2xl",
          "bg-gradient-to-r from-emerald-600 to-teal-600",
          "hover:from-emerald-700 hover:to-teal-700",
          "transition-all duration-200",
        )}
      >
        {getButtonText()}
      </Button>

      {/* Disclaimer */}
      <div
        className={cn(
          "flex items-start gap-2 p-3 rounded-lg",
          isMonthly
            ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
            : "bg-gray-50 dark:bg-slate-800/50",
        )}
      >
        {isMonthly ? (
          <>
            <RefreshCw
              className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <span className="font-semibold">Recurring charge:</span> Your card
              will be billed ${chargeAmount.toFixed(2)} monthly. You can cancel
              anytime via the link in your receipt email.
            </p>
          </>
        ) : (
          <>
            <CreditCard
              className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This is a one-time charge. Your card will not be saved.
            </p>
          </>
        )}
      </div>
    </form>
  );
}
