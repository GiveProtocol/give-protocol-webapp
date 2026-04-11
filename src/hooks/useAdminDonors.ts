import { useCallback, useState } from "react";
import { useToast } from "../contexts/ToastContext";
import { getDonorDetail, listDonors, updateDonorStatus } from "../services/adminDonorService";
import type {
  AdminDonorDetail,
  AdminDonorListFilters,
  AdminDonorListResult,
  AdminDonorStatusUpdateInput,
  DonorUserStatus,
} from "../types/adminDonor";

const INITIAL_RESULT: AdminDonorListResult = {
  donors: [],
  totalCount: 0,
  page: 1,
  limit: 50,
  totalPages: 0,
};

/**
 * Hook for admin donor management: listing, filtering, detail, and status updates.
 * @function useAdminDonors
 * @description Provides state management for the admin donor management page,
 * including paginated listing, filtering, detail fetching, and suspend/reinstate/ban actions.
 * @returns {Object} Donor list state and action functions
 * @returns {AdminDonorListResult} returns.result - Current paginated donor list
 * @returns {boolean} returns.loading - Loading state for list fetches
 * @returns {boolean} returns.updating - Loading state for status updates
 * @returns {AdminDonorDetail | null} returns.detail - Current donor detail
 * @returns {boolean} returns.detailLoading - Loading state for detail fetch
 * @returns {Function} returns.fetchDonors - Fetch donors with filters
 * @returns {Function} returns.fetchDonorDetail - Fetch full donor detail
 * @returns {Function} returns.suspendDonor - Suspend an active donor
 * @returns {Function} returns.reinstateDonor - Reinstate a suspended donor
 * @returns {Function} returns.banDonor - Permanently ban a donor
 */
export function useAdminDonors() {
  const [result, setResult] = useState<AdminDonorListResult>(INITIAL_RESULT);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [detail, setDetail] = useState<AdminDonorDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { showToast } = useToast();

  const fetchDonors = useCallback(
    async (filters: AdminDonorListFilters = {}) => {
      try {
        setLoading(true);
        const data = await listDonors(filters);
        setResult(data);
        return data;
      } catch (error) {
        showToast("error", "Failed to load donors");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const fetchDonorDetail = useCallback(
    async (userId: string) => {
      try {
        setDetailLoading(true);
        const data = await getDonorDetail(userId);
        setDetail(data);
        return data;
      } catch (error) {
        showToast("error", "Failed to load donor details");
        throw error;
      } finally {
        setDetailLoading(false);
      }
    },
    [showToast],
  );

  const performStatusUpdate = useCallback(
    async (
      input: AdminDonorStatusUpdateInput,
      successMessage: string,
      currentFilters: AdminDonorListFilters = {},
    ) => {
      try {
        setUpdating(true);
        const auditId = await updateDonorStatus(input);
        if (auditId === null) {
          showToast("error", "Status update failed. Please try again.");
          return false;
        }
        showToast("success", successMessage);
        const data = await listDonors(currentFilters);
        setResult(data);
        return true;
      } catch (error) {
        showToast("error", "Status update failed. Please try again.");
        throw error;
      } finally {
        setUpdating(false);
      }
    },
    [showToast],
  );

  const suspendDonor = useCallback(
    async (
      userId: string,
      reason: string,
      currentFilters?: AdminDonorListFilters,
    ) => {
      const newStatus: DonorUserStatus = "suspended";
      return performStatusUpdate(
        { userId, newStatus, reason },
        "Donor suspended",
        currentFilters,
      );
    },
    [performStatusUpdate],
  );

  const reinstateDonor = useCallback(
    async (
      userId: string,
      reason?: string,
      currentFilters?: AdminDonorListFilters,
    ) => {
      const newStatus: DonorUserStatus = "active";
      return performStatusUpdate(
        { userId, newStatus, reason },
        "Donor reinstated successfully",
        currentFilters,
      );
    },
    [performStatusUpdate],
  );

  const banDonor = useCallback(
    async (
      userId: string,
      reason: string,
      currentFilters?: AdminDonorListFilters,
    ) => {
      const newStatus: DonorUserStatus = "banned";
      return performStatusUpdate(
        { userId, newStatus, reason },
        "Donor banned",
        currentFilters,
      );
    },
    [performStatusUpdate],
  );

  return {
    result,
    loading,
    updating,
    detail,
    detailLoading,
    fetchDonors,
    fetchDonorDetail,
    suspendDonor,
    reinstateDonor,
    banDonor,
  };
}
