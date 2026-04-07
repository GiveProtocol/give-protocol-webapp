import { jest } from "@jest/globals";

export const shortenAddress = jest.fn(
  (address) => `${address.slice(0, 6)}...${address.slice(-4)}`,
);

export const isValidAddress = jest.fn(() => true);

export const formatTokenAmount = jest.fn((amount) => String(amount));
