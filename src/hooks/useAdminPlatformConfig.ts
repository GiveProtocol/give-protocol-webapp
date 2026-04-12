import { useCallback, useState } from "react";
import { useToast } from "../contexts/ToastContext";
import {
  getConfig,
  getConfigAudit,
  updateConfig,
} from "../services/adminPlatformConfigService";
import type {
  AdminUpdateConfigInput,
  PlatformConfigAuditEntry,
  PlatformConfigEntry,
} from "../types/adminPlatformConfig";

/**
 * Hook for admin platform configuration management: fetching, editing, and audit history.
 * @function useAdminPlatformConfig
 * @description Provides state management for the admin platform settings page,
 * including loading all config entries, updating individual values, and viewing
 * the change audit history.
 * @returns {Object} Platform config state and action functions
 * @returns {PlatformConfigEntry[]} returns.configs - Current platform configuration entries
 * @returns {boolean} returns.loading - Loading state for config fetch
 * @returns {boolean} returns.saving - Loading state for config update
 * @returns {PlatformConfigAuditEntry[]} returns.auditLog - Recent config change audit entries
 * @returns {boolean} returns.auditLoading - Loading state for audit fetch
 * @returns {Function} returns.fetchConfig - Fetch all platform configuration entries
 * @returns {Function} returns.saveConfig - Save a single configuration entry
 * @returns {Function} returns.fetchAuditLog - Fetch the configuration change history
 */
export function useAdminPlatformConfig() {
  const [configs, setConfigs] = useState<PlatformConfigEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [auditLog, setAuditLog] = useState<PlatformConfigAuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const { showToast } = useToast();

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getConfig();
      setConfigs(data);
      return data;
    } catch (error) {
      showToast("error", "Failed to load platform configuration");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const saveConfig = useCallback(
    async (input: AdminUpdateConfigInput) => {
      try {
        setSaving(true);
        const success = await updateConfig(input);
        if (!success) {
          showToast("error", "Failed to save configuration. Please try again.");
          return false;
        }
        showToast("success", "Configuration saved successfully");
        const data = await getConfig();
        setConfigs(data);
        return true;
      } catch (error) {
        showToast("error", "Failed to save configuration. Please try again.");
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [showToast],
  );

  const fetchAuditLog = useCallback(
    async (limit = 50) => {
      try {
        setAuditLoading(true);
        const data = await getConfigAudit(limit);
        setAuditLog(data);
        return data;
      } catch (error) {
        showToast("error", "Failed to load configuration audit history");
        throw error;
      } finally {
        setAuditLoading(false);
      }
    },
    [showToast],
  );

  return {
    configs,
    loading,
    saving,
    auditLog,
    auditLoading,
    fetchConfig,
    saveConfig,
    fetchAuditLog,
  };
}
