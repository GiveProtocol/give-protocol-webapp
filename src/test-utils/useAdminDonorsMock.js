// Mock for @/hooks/useAdminDonors
// Mapped via moduleNameMapper — useAdminDonors is a jest.fn() so
// tests can call mockReturnValue to supply per-test return values.
import { jest } from "@jest/globals";

export const useAdminDonors = jest.fn(() => ({
  result: { donors: [], totalCount: 0, page: 1, limit: 50, totalPages: 0 },
  loading: false,
  updating: false,
  detail: null,
  detailLoading: false,
  fetchDonors: jest.fn(),
  fetchDonorDetail: jest.fn(),
  suspendDonor: jest.fn(),
  reinstateDonor: jest.fn(),
  banDonor: jest.fn(),
}));
