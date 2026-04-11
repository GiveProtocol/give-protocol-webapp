import { useCallback, useState } from "react";
import { useToast } from "../contexts/ToastContext";
import { getAdminAuditLog } from "../services/adminAuditService";
import type {
  AdminAuditLogFilters,
  AdminAuditLogResult,
} from "../types/adminAudit";

const INITIAL_RESULT: AdminAuditLogResult = {
  entries: [],
  totalCount: 0,
  page: 1,
  limit: 50,
  totalPages: 0,
};

/**
 * Hook for querying the admin audit log with filters and pagination.
 * @function useAdminAuditLog
 * @description Provides state management for the admin audit log viewer,
 * including loading state, error handling, and paginated results.
 * @returns {Object} Audit log state and fetch function
 * @returns {AdminAuditLogResult} returns.result - Current paginated result
 * @returns {boolean} returns.loading - Loading state
 * @returns {Function} returns.fetchAuditLog - Fetch audit log with filters
 */
export function useAdminAuditLog() {
  const [result, setResult] = useState<AdminAuditLogResult>(INITIAL_RESULT);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchAuditLog = useCallback(
    async (filters: AdminAuditLogFilters = {}) => {
      try {
        setLoading(true);
        const data = await getAdminAuditLog(filters);
        setResult(data);
        return data;
      } catch (error) {
        showToast("error", "Failed to load audit log");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  return {
    result,
    loading,
    fetchAuditLog,
  };
}
