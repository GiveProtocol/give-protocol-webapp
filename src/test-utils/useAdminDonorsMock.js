// Mock for @/hooks/useAdminDonors
// Mapped via moduleNameMapper — useAdminDonors is a jest.fn() so tests
// can call mockReturnValue to provide per-test donor list state.
import { jest } from "@jest/globals";

export const useAdminDonors = jest.fn(() => ({
  result: {
    donors: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  },
  loading: false,
  updating: false,
  detail: null,
  detailLoading: false,
  fetchDonors: jest.fn().mockResolvedValue({
    donors: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  }),
  fetchDonorDetail: jest.fn().mockResolvedValue(null),
  suspendDonor: jest.fn().mockResolvedValue(true),
  reinstateDonor: jest.fn().mockResolvedValue(true),
  banDonor: jest.fn().mockResolvedValue(true),
}));
