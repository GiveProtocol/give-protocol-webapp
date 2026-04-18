// Mock for @/services/charityVerificationService
// Mapped via moduleNameMapper so all charityVerificationService imports get this mock.
import { jest } from "@jest/globals";

export const getCharityVerificationStatus = jest.fn(() =>
  Promise.resolve(null),
);
