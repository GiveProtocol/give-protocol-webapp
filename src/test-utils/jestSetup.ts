import { jest } from "@jest/globals";
import React from "react";

/**
 * Common Jest mock configurations
 * This file provides reusable mock objects to eliminate duplication across test files
 */

/**
 * Standard mock implementations for common utilities
 */
export const commonMocks = {
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
  formatDate: jest.fn((date: string) => new Date(date).toLocaleDateString()),
  shortenAddress: jest.fn(
    (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`,
  ),
};

/**
 * Standard mock factories for hooks
 */
export const createHookMocks = () => ({
  web3: {
    address: null,
    chainId: null,
    isConnected: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    switchChain: jest.fn(),
  },
  auth: {
    user: null,
    signOut: jest.fn(),
  },
  wallet: {
    getInstalledWallets: jest.fn(() => [
      { name: "MetaMask", id: "metamask" },
      { name: "WalletConnect", id: "walletconnect" },
    ]),
    connectWallet: jest.fn(),
  },
  walletAlias: {
    alias: null,
    aliases: {},
    isLoading: false,
    loading: false,
    error: null,
    setWalletAlias: jest.fn(),
    deleteWalletAlias: jest.fn(),
  },
  volunteerVerification: {
    verifyHours: jest.fn(),
    acceptApplication: jest.fn(),
    loading: false,
    error: null,
  },
  translation: {
    t: jest.fn((key: string, fallback?: string) => fallback || key),
  },
});

/**
 * Component mocks for testing
 * These are simple mock implementations of common React components
 */

interface MockButtonProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: string;
  disabled?: boolean;
  className?: string;
  [key: string]: unknown;
}

interface MockInputProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  [key: string]: unknown;
}

interface MockCardProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

export const componentMocks = {
  Button: ({
    children,
    onClick,
    variant,
    disabled,
    className,
    ...props
  }: MockButtonProps) =>
    React.createElement(
      "button",
      {
        onClick,
        disabled,
        "data-variant": variant,
        className,
        ...props,
      },
      children,
    ),
  Input: ({
    value,
    onChange,
    placeholder,
    className,
    ...props
  }: MockInputProps) =>
    React.createElement("input", {
      value,
      onChange,
      placeholder,
      className,
      "data-testid": "mock-input",
      ...props,
    }),
  Card: ({ children, className, ...props }: MockCardProps) =>
    React.createElement(
      "div",
      {
        className,
        "data-testid": "mock-card",
        ...props,
      },
      children,
    ),
};
