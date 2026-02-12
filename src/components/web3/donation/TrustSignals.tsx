import React from "react";
import { Lock, Shield, ExternalLink } from "lucide-react";
import { cn } from "@/utils/cn";
import type { PaymentMethod } from "./types/donation";

interface TrustSignalsProps {
  /** Current payment method */
  paymentMethod: PaymentMethod;
  /** Contract address (for crypto mode) */
  contractAddress?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Security badges that change based on payment mode
 * @component TrustSignals
 * @description Displays trust indicators appropriate to the payment method.
 * Card mode shows "Secure processing by Helcim", crypto shows "Verified Contract".
 * @param {Object} props - Component props
 * @param {PaymentMethod} props.paymentMethod - Current payment method
 * @param {string} [props.contractAddress] - Contract address for crypto mode
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Trust signals component
 */
export function TrustSignals({
  paymentMethod,
  contractAddress,
  className,
}: TrustSignalsProps): React.ReactElement {
  if (paymentMethod === "card") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 py-3 px-4",
          "bg-gray-50 dark:bg-slate-800/50 rounded-lg",
          "border border-gray-200 dark:border-slate-700",
          className,
        )}
      >
        <Lock
          className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
          aria-hidden="true"
        />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Secure processing by{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            Helcim
          </span>
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">|</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          256-bit SSL encryption
        </span>
      </div>
    );
  }

  // Crypto mode
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-3 px-4",
        "bg-gray-50 dark:bg-slate-800/50 rounded-lg",
        "border border-gray-200 dark:border-slate-700",
        className,
      )}
    >
      <Shield
        className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
        aria-hidden="true"
      />
      <span className="text-xs text-gray-600 dark:text-gray-400">
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          Verified Contract
        </span>
      </span>
      {contractAddress && (
        <>
          <span className="text-xs text-gray-400 dark:text-gray-500">|</span>
          <a
            href={`https://basescan.org/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1 text-xs",
              "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300",
              "transition-colors duration-150",
            )}
          >
            <span className="font-mono">
              {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </>
      )}
    </div>
  );
}
