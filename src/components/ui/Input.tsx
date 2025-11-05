import React, { useId } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'enhanced';
}

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

  const baseClasses = "block w-full shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    default: cn(
      "rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-indigo-50",
      error && "border-red-300 focus:border-red-500 focus:ring-red-500"
    ),
    enhanced: cn(
      // Enhanced styling with your specifications
      "border-[1.5px] border-[#e1e4e8] rounded-lg px-4 py-3 text-base bg-[#fafbfc]",
      "focus:border-[#0366d6] focus:shadow-[0_0_0_3px_rgba(3,102,214,0.1)] focus:bg-white",
      error && "border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
    )
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-900">
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
        <p id={errorId} className="text-sm text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};