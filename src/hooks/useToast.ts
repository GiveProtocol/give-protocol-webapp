import { useContext } from "react";
import { ToastContext } from "../contexts/ToastContext";

/**
 * Toast notification hook for accessing toast context functionality
 * @function useToast
 * @description Provides access to the toast notification system. Must be used within a ToastProvider component.
 * Returns the complete toast context including showToast function for displaying notifications with different types and messages.
 * @returns {Object} Toast context object with notification utilities
 * @returns {Function} returns.showToast - Display toast notification: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void
 * @returns {Toast[]} returns.toasts - Array of currently active toast notifications
 * @returns {Function} returns.removeToast - Remove specific toast: (id: string) => void
 * @throws {Error} Throws error if used outside ToastProvider context
 * @example
 * ```tsx
 * const { showToast } = useToast();
 *
 * // Show success notification
 * showToast('success', 'Transaction Complete', 'Your donation was processed successfully');
 *
 * // Show error notification
 * showToast('error', 'Connection Failed', 'Unable to connect to wallet');
 *
 * // Show simple notification
 * showToast('info', 'Profile Updated');
 * ```
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
