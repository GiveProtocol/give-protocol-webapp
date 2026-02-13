import React, { useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { Portal } from "./Portal";

interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether clicking backdrop closes the modal */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Custom class name for the modal content */
  className?: string;
}

/**
 * Reusable Modal component with accessibility features
 * Renders using Portal to escape parent overflow constraints
 *
 * @param props - ModalProps
 * @returns Modal JSX element or null if not open
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle focus trap and keyboard events
  useEffect(() => {
    if (!isOpen) return;

    // Store current focus
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Add escape key listener
    document.addEventListener("keydown", handleKeyDown);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Focus the modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";

      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Backdrop + centering container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
        {/* Invisible backdrop button for dismiss-on-click-outside */}
        {closeOnBackdrop && (
          <button
            type="button"
            className="absolute inset-0 w-full h-full cursor-default"
            onClick={handleBackdropClick}
            aria-label="Close modal"
            tabIndex={-1}
          />
        )}
        {/* Modal content */}
        <div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          className={`
            relative w-full ${sizeClasses[size]} mx-4
            bg-white dark:bg-gray-800
            rounded-2xl shadow-2xl
            transform transition-all duration-200
            animate-slide-up
            ${className}
          `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
