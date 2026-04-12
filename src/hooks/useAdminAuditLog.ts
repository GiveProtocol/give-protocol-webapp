import { useCallback, useState } from "react";
import { useToast } from "../contexts/ToastContext";
import { getAdminAuditLog } from "../services/adminAuditService";
import type {
  AdminAuditLogFilters,
  AdminAuditLogResult,
} from "../types/adminAudit";

const EMPTY_RESULT: AdminAuditLogResult = {
  entries: [],
  totalCount: 0,
  page: 1,
  limit: 50,
  totalPages: 0,
};

/**
 * Hook for querying the admin audit log with optional filters and pagination.
 * @function useAdminAuditLog
 * @description Provides state management for the admin audit log viewer,
 * including loading paginated entries with filtering by action type,
 * entity type, and date range via the admin_get_audit_log RPC.
 * @returns {Object} Audit log state and fetch function
 * @returns {AdminAuditLogEntry[]} returns.entries - Current page of audit log entries
 * @returns {boolean} returns.loading - Whether a fetch is in progress
 * @returns {number} returns.totalCount - Total number of matching entries
 * @returns {number} returns.totalPages - Total number of pages
 * @returns {number} returns.page - Current page number
 * @returns {number} returns.limit - Current page size
 * @returns {Function} returns.fetchAuditLog - Fetch entries with optional filters
 */
export function useAdminAuditLog() {
  const [result, setResult] = useState<AdminAuditLogResult>(EMPTY_RESULT);
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
    entries: result.entries,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    page: result.page,
    limit: result.limit,
    loading,
    fetchAuditLog,
  };
}
