import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAdminPlatformConfig } from "@/hooks/useAdminPlatformConfig";
import {
  configKeyLabel,
  configValueInputType,
} from "@/services/adminPlatformConfigService";
import type {
  PlatformConfigEntry,
  PlatformConfigKey,
  PlatformConfigValue,
} from "@/types/adminPlatformConfig";

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Formats a UTC timestamp string as a localised date-time */
function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Renders a config value for display (truncated JSON for complex types) */
function ValuePreview({
  value,
}: {
  value: PlatformConfigValue;
}): React.ReactElement {
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return <span className="font-mono text-sm">{String(value)}</span>;
  }
  const json = JSON.stringify(value, null, 2);
  const preview = json.length > 120 ? `${json.slice(0, 120)}…` : json;
  return (
    <span className="font-mono text-xs text-gray-500 whitespace-pre-wrap">
      {preview}
    </span>
  );
}

/** Single config row card */
function ConfigCard({
  entry,
  onEdit,
}: {
  entry: PlatformConfigEntry;
  onEdit: (_entry: PlatformConfigEntry) => void;
}): React.ReactElement {
  const handleEdit = useCallback(() => {
    onEdit(entry);
  }, [onEdit, entry]);

  return (
    <Card className="p-4 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">
          {configKeyLabel(entry.key)}
        </p>
        {entry.description !== null && (
          <p className="text-xs text-gray-500 mt-0.5">{entry.description}</p>
        )}
        <div className="mt-2">
          <ValuePreview value={entry.value} />
        </div>
        {entry.updatedAt !== null && (
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {formatDateTime(entry.updatedAt)}
            {entry.updatedBy !== null && ` by ${entry.updatedBy}`}
          </p>
        )}
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleEdit}
        className="shrink-0"
      >
        Edit
      </Button>
    </Card>
  );
}

/** Edit modal for a single config entry */
function EditConfigModal({
  entry,
  saving,
  onSave,
  onClose,
}: {
  entry: PlatformConfigEntry;
  saving: boolean;
  onSave: (_key: PlatformConfigKey, _value: PlatformConfigValue) => void;
  onClose: () => void;
}): React.ReactElement {
  const inputType = configValueInputType(entry.value);
  const [numValue, setNumValue] = useState<number>(
    typeof entry.value === "number" ? entry.value : 0,
  );
  const [jsonValue, setJsonValue] = useState<string>(
    inputType === "json" ? JSON.stringify(entry.value, null, 2) : "",
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleNumChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNumValue(Number(e.target.value));
    },
    [],
  );

  const handleJsonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setJsonValue(e.target.value);
      setJsonError(null);
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (inputType === "number") {
      onSave(entry.key, numValue);
    } else {
      try {
        const parsed = JSON.parse(jsonValue) as PlatformConfigValue;
        onSave(entry.key, parsed);
      } catch {
        setJsonError("Invalid JSON — please check the syntax and try again.");
      }
    }
  }, [inputType, entry.key, numValue, jsonValue, onSave]);

  return (
    <Modal onClose={onClose} title={`Edit: ${configKeyLabel(entry.key)}`}>
      <div className="space-y-4">
        {entry.description !== null && (
          <p className="text-sm text-gray-600">{entry.description}</p>
        )}
        {inputType === "number" ? (
          <div>
            <label
              htmlFor="config-num-value"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Value
            </label>
            <input
              id="config-num-value"
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={numValue}
              onChange={handleNumChange}
              min={0}
            />
          </div>
        ) : (
          <div>
            <label
              htmlFor="config-json-value"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Value (JSON)
            </label>
            <textarea
              id="config-json-value"
              rows={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={jsonValue}
              onChange={handleJsonChange}
            />
            {jsonError !== null && (
              <p className="text-xs text-red-600 mt-1">{jsonError}</p>
            )}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Audit history table */
function AuditTable({
  auditLog,
  auditLoading,
}: {
  auditLog: ReturnType<typeof useAdminPlatformConfig>["auditLog"];
  auditLoading: boolean;
}): React.ReactElement {
  if (auditLoading) {
    return (
      <div className="flex justify-center py-6">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (auditLog.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4">
        No configuration changes recorded yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3">Key</th>
            <th className="px-4 py-3">Old Value</th>
            <th className="px-4 py-3">New Value</th>
            <th className="px-4 py-3">Changed By</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {auditLog.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{row.configKey}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[160px] truncate">
                {row.oldValue !== null ? JSON.stringify(row.oldValue) : "—"}
              </td>
              <td className="px-4 py-3 font-mono text-xs max-w-[160px] truncate">
                {row.newValue !== null ? JSON.stringify(row.newValue) : "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {row.adminUserId ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {formatDateTime(row.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

/**
 * Admin platform configuration page.
 * Allows administrators to view and edit platform-wide settings stored in
 * the platform_config table, and to review the change audit history.
 *
 * @function AdminPlatformConfig
 * @returns {JSX.Element} The admin platform settings page
 */
export default function AdminPlatformConfig(): React.ReactElement {
  const {
    configs,
    loading,
    saving,
    auditLog,
    auditLoading,
    fetchConfig,
    saveConfig,
    fetchAuditLog,
  } = useAdminPlatformConfig();

  const [editingEntry, setEditingEntry] = useState<PlatformConfigEntry | null>(
    null,
  );
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const handleEdit = useCallback((entry: PlatformConfigEntry) => {
    setEditingEntry(entry);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingEntry(null);
  }, []);

  const handleSaveConfig = useCallback(
    async (key: PlatformConfigKey, value: PlatformConfigValue) => {
      const success = await saveConfig({ key, value });
      if (success) {
        setEditingEntry(null);
      }
    },
    [saveConfig],
  );

  const handleToggleAudit = useCallback(async () => {
    if (!showAudit) {
      await fetchAuditLog();
    }
    setShowAudit((prev) => !prev);
  }, [showAudit, fetchAuditLog]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage platform-wide configuration. Changes are logged in the audit
            history.
          </p>
        </div>
        <Button variant="secondary" onClick={handleToggleAudit}>
          {showAudit ? "Hide Audit History" : "View Audit History"}
        </Button>
      </div>

      {/* Audit history panel */}
      {showAudit && (
        <Card className="mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">
              Configuration Change History
            </h2>
          </div>
          <AuditTable auditLog={auditLog} auditLoading={auditLoading} />
        </Card>
      )}

      {/* Config entries */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : configs.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 text-sm">
            No platform configuration found. Ensure the platform_config table
            has been seeded.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {configs.map((entry) => (
            <ConfigCard key={entry.key} entry={entry} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingEntry !== null && (
        <EditConfigModal
          entry={editingEntry}
          saving={saving}
          onSave={handleSaveConfig}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
