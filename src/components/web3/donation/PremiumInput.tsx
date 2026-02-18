import React, { useState, useCallback, useId } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PremiumInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /** Label text (used as floating label) */
  label: string;
  /** Icon component from lucide-react */
  icon?: LucideIcon;
  /** Error message to display */
  error?: string;
  /** Helper text shown below input */
  helperText?: string;
}

/**
 * Renders error or helper text feedback below the input
 * Extracted to reduce PremiumInput cognitive complexity (S3776)
 */
function renderInputFeedback(
  error: string | undefined,
  helperText: string | undefined,
  errorId: string,
  helperId: string,
): React.ReactNode {
  if (error) {
    return (
      <p
        id={errorId}
        className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5"
        role="alert"
        aria-live="polite"
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {error}
      </p>
    );
  }

  if (helperText) {
    return (
      <p
        id={helperId}
        className="mt-2 text-sm text-gray-500 dark:text-gray-400"
      >
        {helperText}
      </p>
    );
  }

  return null;
}

/**
 * Premium input field with floating label and fintech-grade styling
 * @component PremiumInput
 * @description High-trust input component inspired by Stripe/Amex design patterns.
 * Features floating label, smooth transitions, and integrated icon support.
 * @param {Object} props - Component props
 * @param {string} props.label - Floating label text
 * @param {LucideIcon} [props.icon] - Optional lucide icon component
 * @param {string} [props.error] - Error message
 * @param {string} [props.helperText] - Helper text below input
 * @returns {React.ReactElement} Premium input component
 */
export function PremiumInput({
  label,
  icon: Icon,
  error,
  helperText,
  value,
  onFocus,
  onBlur,
  disabled,
  id: providedId,
  ...props
}: PremiumInputProps): React.ReactElement {
  const generatedId = useId();
  const inputId = providedId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const [isFocused, setIsFocused] = useState(false);

  // Determine if label should float (focused or has value)
  const hasValue = value !== undefined && value !== '';
  const shouldFloat = isFocused || hasValue;

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );

  const borderClass = isFocused
    ? 'border-transparent ring-2 ring-emerald-500 dark:ring-emerald-400'
    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500';
  const iconColorClass = error
    ? 'text-red-400 dark:text-red-500'
    : 'text-gray-400 dark:text-gray-500';
  const labelColorClass = isFocused
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-gray-500 dark:text-gray-400';

  return (
    <div className="w-full">
      {/* Input container */}
      <div
        className={cn(
          'relative h-14 rounded-xl',
          'transition-all duration-200 ease-in-out',
          // Background
          isFocused
            ? 'bg-white dark:bg-slate-900'
            : 'bg-gray-50 dark:bg-slate-800/70',
          // Border and ring
          'border-2',
          error ? 'border-red-300 dark:border-red-500' : borderClass,
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2',
              'transition-colors duration-200',
              isFocused ? 'text-emerald-600 dark:text-emerald-400' : iconColorClass
            )}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}

        {/* Floating Label */}
        <label
          htmlFor={inputId}
          className={cn(
            'absolute left-0 transition-all duration-200 ease-out pointer-events-none',
            'font-medium',
            Icon ? 'ml-12' : 'ml-4',
            // Floating position
            shouldFloat
              ? 'top-2 text-xs'
              : 'top-1/2 -translate-y-1/2 text-sm',
            // Color
            error ? 'text-red-500 dark:text-red-400' : labelColorClass
          )}
        >
          {label}
        </label>

        {/* Input field */}
        <input
          id={inputId}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(error && errorId, helperText && helperId) || undefined}
          className={cn(
            'absolute inset-0 w-full h-full',
            'bg-transparent border-none outline-none',
            'text-gray-900 dark:text-white font-medium',
            'placeholder:text-transparent',
            'rounded-xl',
            // Padding based on icon and floating label
            Icon ? 'pl-12 pr-4' : 'pl-4 pr-4',
            'pt-5 pb-2', // Account for floating label space
            // Disabled
            disabled && 'cursor-not-allowed'
          )}
          {...props}
        />
      </div>

      {/* Error or helper text feedback */}
      {renderInputFeedback(error, helperText, errorId, helperId)}
    </div>
  );
}
