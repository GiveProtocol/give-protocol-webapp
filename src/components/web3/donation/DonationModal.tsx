import React, {
  useCallback,
  useReducer,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

// Components
import { DonationForm } from "./DonationForm";
import { ScheduledDonationForm } from "./ScheduledDonationForm";
import { FiatDonationForm } from "./FiatDonationForm";
import { PaymentMethodToggle } from "./PaymentMethodToggle";
import { FiatPresets } from "./FiatPresets";
import { TrustSignals } from "./TrustSignals";

// Types
import type {
  PaymentMethod,
  DonationFrequency,
  DonationResult,
  DonationModalState,
  DonationModalAction,
  HelcimPaymentResult,
} from "./types/donation";
import { calculateFeeOffset } from "./types/donation";
import { getERC20TokensForChain, type TokenConfig } from "@/config/tokens";
import { getContractAddress, CHAIN_IDS } from "@/config/contracts";
import { useWeb3 } from "@/contexts/Web3Context";

interface DonationModalProps {
  /** Display name of the charity */
  charityName: string;
  /** Blockchain address of the charity */
  charityAddress: string;
  /** Unique ID for the charity (for Helcim metadata) */
  charityId: string;
  /** Donation frequency - determines modal mode */
  frequency: DonationFrequency;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Optional callback after successful donation */
  onSuccess?: (_result: DonationResult) => void;
}

function createInitialState(frequency: DonationFrequency): DonationModalState {
  return {
    paymentMethod: "crypto",
    frequency,
    step: "input",
    amount: 0,
    coverFees: false,
    error: null,
    result: null,
  };
}

function donationReducer(
  state: DonationModalState,
  action: DonationModalAction,
): DonationModalState {
  switch (action.type) {
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.payload, error: null };
    case "SET_FREQUENCY":
      return { ...state, frequency: action.payload, error: null };
    case "SET_AMOUNT":
      return { ...state, amount: action.payload, error: null };
    case "SET_COVER_FEES":
      return { ...state, coverFees: action.payload };
    case "START_PROCESSING":
      return { ...state, step: "processing", error: null };
    case "SET_SUCCESS":
      return { ...state, step: "success", result: action.payload, error: null };
    case "SET_ERROR":
      return { ...state, step: "error", error: action.payload };
    case "RESET":
      return {
        ...createInitialState(state.frequency),
        paymentMethod: state.paymentMethod,
      };
    default:
      return state;
  }
}

/**
 * Unified donation modal supporting both crypto and card payments
 * @component DonationModal
 * @description Full-featured donation gateway with payment method toggle.
 * Frequency is determined by the entry point (Give Once vs Give Monthly buttons).
 * @param {Object} props - Component props
 * @param {string} props.charityName - Display name of the charity
 * @param {string} props.charityAddress - Blockchain address
 * @param {string} props.charityId - Unique identifier for fiat payments
 * @param {DonationFrequency} props.frequency - 'once' or 'monthly' (locked mode)
 * @param {function} props.onClose - Close callback
 * @param {function} [props.onSuccess] - Success callback
 * @returns {React.ReactElement} Donation modal
 */
export const DonationModal: React.FC<DonationModalProps> = ({
  charityName,
  charityAddress,
  charityId,
  frequency,
  onClose,
  onSuccess,
}) => {
  const [state, dispatch] = useReducer(
    donationReducer,
    frequency,
    createInitialState,
  );
  const { chainId } = useWeb3();

  // Get token for fiat presets
  const availableTokens = useMemo(() => {
    return getERC20TokensForChain(chainId ?? CHAIN_IDS.BASE);
  }, [chainId]);

  const [selectedToken, setSelectedToken] = useState<TokenConfig>(
    availableTokens[0],
  );

  // Get donation contract address for trust signals
  const contractAddress = useMemo(() => {
    return getContractAddress("DONATION", chainId ?? CHAIN_IDS.BASE);
  }, [chainId]);

  // Update selected token when chain changes
  useEffect(() => {
    if (
      availableTokens.length > 0 &&
      !availableTokens.includes(selectedToken)
    ) {
      setSelectedToken(availableTokens[0]);
    }
  }, [availableTokens, selectedToken]);

  // Action handlers
  const handlePaymentMethodChange = useCallback((method: PaymentMethod) => {
    dispatch({ type: "SET_PAYMENT_METHOD", payload: method });
  }, []);

  const handleAmountChange = useCallback((amount: number) => {
    dispatch({ type: "SET_AMOUNT", payload: amount });
  }, []);

  const handleCoverFeesChange = useCallback((cover: boolean) => {
    dispatch({ type: "SET_COVER_FEES", payload: cover });
  }, []);

  // Success handlers
  const handleCryptoSuccess = useCallback(() => {
    const result: DonationResult = {
      transactionId: "crypto-tx", // Actual hash handled by form
      amount: state.amount,
      currency: selectedToken.symbol,
      paymentMethod: "crypto",
      isRecurring: frequency === "monthly",
      timestamp: new Date(),
    };
    dispatch({ type: "SET_SUCCESS", payload: result });
    onSuccess?.(result);
    setTimeout(onClose, 2000);
  }, [state.amount, frequency, selectedToken.symbol, onSuccess, onClose]);

  const handleFiatSuccess = useCallback(
    (paymentResult: HelcimPaymentResult) => {
      const { total } = calculateFeeOffset(state.coverFees ? state.amount : 0);
      const chargeAmount = state.coverFees ? total : state.amount;

      const result: DonationResult = {
        transactionId: paymentResult.transactionId,
        amount: chargeAmount,
        currency: "USD",
        paymentMethod: "card",
        isRecurring: frequency === "monthly",
        timestamp: new Date(),
      };
      dispatch({ type: "SET_SUCCESS", payload: result });
      onSuccess?.(result);
    },
    [state.amount, state.coverFees, frequency, onSuccess],
  );

  const handleFiatError = useCallback((error: Error) => {
    dispatch({ type: "SET_ERROR", payload: error.message });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Modal title based on state and frequency
  const modalTitle = useMemo(() => {
    if (state.step === "success") {
      return "Thank You!";
    }
    if (state.step === "error") {
      return "Something Went Wrong";
    }
    return frequency === "monthly"
      ? `Support ${charityName} Monthly`
      : `Donate to ${charityName}`;
  }, [state.step, frequency, charityName]);

  // Frequency badge component
  const FrequencyBadge = useMemo(() => {
    if (frequency === "monthly") {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
          <Calendar className="w-3 h-3" />
          Monthly
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
        <Zap className="w-3 h-3" />
        One-Time
      </div>
    );
  }, [frequency]);

  // Render success state
  if (state.step === "success" && state.result) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
        <Card className="w-full max-w-md relative shadow-2xl rounded-2xl animate-slideIn my-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full p-1 hover:bg-white dark:hover:bg-slate-700"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your {state.result.isRecurring ? "monthly " : ""}donation of{" "}
              {state.result.paymentMethod === "card"
                ? `$${state.result.amount.toFixed(2)}`
                : `${state.result.amount} ${state.result.currency}`}{" "}
              to {charityName} has been processed.
            </p>
            {state.result.isRecurring && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">
                You&apos;ll be charged monthly until you cancel.
              </p>
            )}
            {state.result.paymentMethod === "card" && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                A receipt has been sent to your email.
              </p>
            )}
            <Button onClick={onClose} className="mt-6" fullWidth>
              Done
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render error state
  if (state.step === "error") {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
        <Card className="w-full max-w-md relative shadow-2xl rounded-2xl animate-slideIn my-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full p-1 hover:bg-white dark:hover:bg-slate-700"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Something Went Wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {state.error || "An unexpected error occurred. Please try again."}
            </p>
            <div className="flex gap-3">
              <Button onClick={handleReset} variant="secondary" fullWidth>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={onClose} fullWidth>
                Close
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Main input state
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <Card className="w-full max-w-md relative shadow-2xl rounded-2xl animate-slideIn my-8 dark:bg-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full p-1 hover:bg-white dark:hover:bg-slate-700"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Header with title and frequency badge */}
          <div className="mb-6 pr-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {modalTitle}
              </h2>
            </div>
            {FrequencyBadge}
          </div>

          {/* Payment Method Toggle */}
          <div className="mb-6">
            <PaymentMethodToggle
              value={state.paymentMethod}
              onChange={handlePaymentMethodChange}
              disabled={state.step === "processing"}
            />
          </div>

          {/* Content based on payment method */}
          <div
            className={cn(
              "transition-opacity duration-200 ease-out",
              state.step === "processing" && "opacity-50 pointer-events-none",
            )}
          >
            {state.paymentMethod === "crypto" ? (
              // Crypto mode - use existing forms
              frequency === "once" ? (
                <DonationForm
                  charityAddress={charityAddress}
                  onSuccess={handleCryptoSuccess}
                />
              ) : (
                <ScheduledDonationForm
                  charityAddress={charityAddress}
                  charityName={charityName}
                  onSuccess={handleCryptoSuccess}
                  onClose={onClose}
                />
              )
            ) : (
              // Card mode - fiat donation form
              <div className="space-y-6">
                {/* Fiat presets for amount selection */}
                <FiatPresets
                  selectedToken={selectedToken}
                  onAmountSelect={handleAmountChange}
                />

                {/* Amount display */}
                {state.amount > 0 && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Donation Amount
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${state.amount.toFixed(2)}
                    </p>
                    {frequency === "monthly" && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                        per month
                      </p>
                    )}
                  </div>
                )}

                <FiatDonationForm
                  charityId={charityId}
                  charityName={charityName}
                  amount={state.amount}
                  frequency={frequency}
                  coverFees={state.coverFees}
                  onCoverFeesChange={handleCoverFeesChange}
                  onSuccess={handleFiatSuccess}
                  onError={handleFiatError}
                />
              </div>
            )}
          </div>

          {/* Trust signals */}
          <div className="mt-6">
            <TrustSignals
              paymentMethod={state.paymentMethod}
              contractAddress={contractAddress}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
