// Mock for @/hooks/useWalletBalance
// Mapped via moduleNameMapper so all useWalletBalance imports get this mock.
import { jest } from "@jest/globals";

export const useWalletBalance = jest.fn(() => ({
  native: undefined,
  nativeSymbol: "DEV",
  usdValue: undefined,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
}));

export default useWalletBalance;
