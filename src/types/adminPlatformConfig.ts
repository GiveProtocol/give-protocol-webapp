/**
 * Known platform configuration keys.
 * Each key maps to a JSONB value in the platform_config table.
 */
export type PlatformConfigKey =
  | "min_donation_usd"
  | "max_causes_per_charity"
  | "max_opportunities_per_charity"
  | "validation_window_days"
  | "supported_tokens"
  | "supported_networks";

/** The JSONB value stored in platform_config — can be any JSON-serialisable type */
export type PlatformConfigValue = number | string | boolean | Record<string, unknown> | unknown[];

/** A single platform configuration entry (camelCase) */
export interface PlatformConfigEntry {
  key: PlatformConfigKey;
  value: PlatformConfigValue;
  description: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
}

/** A single audit row from platform_config_audit (camelCase) */
export interface PlatformConfigAuditEntry {
  id: string;
  configKey: PlatformConfigKey;
  oldValue: PlatformConfigValue | null;
  newValue: PlatformConfigValue | null;
  adminUserId: string | null;
  createdAt: string;
}

/** Input for admin_update_config RPC */
export interface AdminUpdateConfigInput {
  key: PlatformConfigKey;
  value: PlatformConfigValue;
}

/** Raw database row from admin_get_config RPC (snake_case) */
export interface PlatformConfigRow {
  key: string;
  value: PlatformConfigValue;
  description: string | null;
  updated_by: string | null;
  updated_at: string | null;
}

/** Raw database row from admin_get_config_audit RPC (snake_case) */
export interface PlatformConfigAuditRow {
  id: string;
  config_key: string;
  old_value: PlatformConfigValue | null;
  new_value: PlatformConfigValue | null;
  admin_user_id: string | null;
  created_at: string;
}
