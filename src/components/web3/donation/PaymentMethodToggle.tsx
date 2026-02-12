import React, { useCallback } from 'react';
import { Wallet, CreditCard } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { PaymentMethod } from './types/donation';

interface PaymentMethodToggleProps {
  /** Currently selected payment method */
  value: PaymentMethod;
  /** Callback when payment method changes */
  onChange: (_method: PaymentMethod) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
}

/**
 * Segmented control for selecting between crypto and card payments
 * @component PaymentMethodToggle
 * @description Toggle component with wallet and credit card icons for payment method selection.
 * Uses emerald/teal gradient for active state with smooth transitions.
 * @param {Object} props - Component props
 * @param {PaymentMethod} props.value - Currently selected method ('crypto' | 'card')
 * @param {function} props.onChange - Callback when selection changes
 * @param {boolean} [props.disabled] - Whether the toggle is disabled
 * @returns {React.ReactElement} Payment method toggle component
 */
export function PaymentMethodToggle({
  value,
  onChange,
  disabled = false,
}: PaymentMethodToggleProps): React.ReactElement {
  const handleCryptoClick = useCallback(() => {
    if (!disabled) {
      onChange('crypto');
    }
  }, [disabled, onChange]);

  const handleCardClick = useCallback(() => {
    if (!disabled) {
      onChange('card');
    }
  }, [disabled, onChange]);

  return (
    <div className="w-full">
      <div
        className={cn(
          'relative flex rounded-xl p-1',
          'bg-gray-100 dark:bg-slate-800',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Sliding background indicator */}
        <div
          className={cn(
            'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg',
            'bg-gradient-to-r from-emerald-600 to-teal-600',
            'shadow-lg transition-transform duration-200 ease-out',
            value === 'card' && 'translate-x-[calc(100%+4px)]'
          )}
        />

        {/* Wallet button */}
        <button
          type="button"
          onClick={handleCryptoClick}
          disabled={disabled}
          className={cn(
            'relative z-10 flex-1 flex items-center justify-center gap-2',
            'px-4 py-3 rounded-lg',
            'text-sm font-semibold transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
            value === 'crypto'
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          )}
          aria-pressed={value === 'crypto'}
        >
          <Wallet className="w-4 h-4" aria-hidden="true" />
          <span>Wallet</span>
        </button>

        {/* Card button */}
        <button
          type="button"
          onClick={handleCardClick}
          disabled={disabled}
          className={cn(
            'relative z-10 flex-1 flex items-center justify-center gap-2',
            'px-4 py-3 rounded-lg',
            'text-sm font-semibold transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
            value === 'card'
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          )}
          aria-pressed={value === 'card'}
        >
          <CreditCard className="w-4 h-4" aria-hidden="true" />
          <span>Card</span>
        </button>
      </div>
    </div>
  );
}
