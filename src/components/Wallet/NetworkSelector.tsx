import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, Globe } from "lucide-react";
import type { NetworkSelectorProps, NetworkType } from "./types";
import { NETWORKS } from "./types";

/**
 * Network icon component that displays a colored dot for each network
 */
interface NetworkIconProps {
  color: string;
  size?: number;
}

const NetworkIcon: React.FC<NetworkIconProps> = ({ color, size = 8 }) => (
  <div
    className="rounded-full flex-shrink-0"
    style={{
      width: size,
      height: size,
      backgroundColor: color,
    }}
    aria-hidden="true"
  />
);

/**
 * NetworkSelector component - Allows switching between blockchain networks
 * @param props - NetworkSelectorProps
 * @returns Network selector dropdown JSX element
 */
export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  currentNetwork,
  onNetworkChange,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentNetworkConfig = NETWORKS.find((n) => n.id === currentNetwork);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleNetworkSelect = useCallback(
    (network: NetworkType) => {
      onNetworkChange(network);
      setIsOpen(false);
    },
    [onNetworkChange],
  );

  const handleNetworkClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const networkId = event.currentTarget.dataset.networkId as NetworkType;
      if (networkId) {
        handleNetworkSelect(networkId);
      }
    },
    [handleNetworkSelect],
  );

  const handleNetworkKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const networkId = event.currentTarget.dataset.networkId as NetworkType;
        if (networkId) {
          handleNetworkSelect(networkId);
        }
      }
    },
    [handleNetworkSelect],
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2
          bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-xl shadow-sm
          transition-all duration-200
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
          ${isOpen ? "ring-2 ring-green-500 ring-offset-1 dark:ring-offset-gray-900" : ""}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current network: ${currentNetworkConfig?.name || currentNetwork}`}
      >
        <Globe aria-hidden="true" className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        {currentNetworkConfig && (
          <>
            <NetworkIcon color={currentNetworkConfig.color} size={8} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
              {currentNetworkConfig.name}
            </span>
          </>
        )}
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          role="menu"
          aria-label="Select network"
        >
          <div className="p-1">
            {NETWORKS.map((network) => {
              const isSelected = network.id === currentNetwork;
              return (
                <button
                  key={network.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  data-network-id={network.id}
                  onClick={handleNetworkClick}
                  onKeyDown={handleNetworkKeyDown}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5
                    rounded-lg transition-colors
                    ${
                      isSelected
                        ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <NetworkIcon color={network.color} size={10} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{network.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {network.token}
                    </p>
                  </div>
                  {isSelected && (
                    <Check aria-hidden="true" className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
