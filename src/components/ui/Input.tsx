import React, { useId } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'enhanced' | 'fintech';
}

/** Reusable text input component with label, error, and helper text support in default or enhanced variants. */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  variant = 'default',
  id: providedId,
  'aria-label': ariaLabel,
  ...props
}) => {
  const generatedId = useId();
  const inputId = providedId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const baseClasses = "block w-full font-sans text-[0.9rem] shadow-sm transition-all duration-200 placeholder:text-slate-300 dark:placeholder:text-gray-500 focus:outline-none text-gray-900 dark:text-gray-100";

  const variantClasses = {
    default: cn(
      "px-[0.9rem] py-[0.7rem] rounded-[10px] border-[1.5px] border-slate-300 dark:border-gray-600 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)] bg-white dark:bg-gray-700",
      error && "border-red-300 dark:border-red-600 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
    ),
    enhanced: cn(
      "border-[1.5px] border-slate-300 dark:border-gray-600 rounded-[10px] px-[0.9rem] py-[0.7rem] bg-white dark:bg-gray-700",
      "focus:border-emerald-500 dark:focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]",
      error && "border-red-300 dark:border-red-600 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
    ),
    fintech: cn(
      "border-[1.5px] border-slate-300 dark:border-gray-600 shadow-none bg-white dark:bg-gray-700 rounded-[10px] px-[0.9rem] py-[0.7rem]",
      "focus:border-emerald-500 dark:focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]",
      error && "border-red-300 dark:border-red-600 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
    )
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-[0.8rem] font-semibold text-slate-700 dark:text-gray-100 tracking-[0.01em]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        aria-label={ariaLabel || label}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={cn(
          error && errorId,
          helperText && helperId
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};