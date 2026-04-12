/** A single row from the admin_charity_growth_report RPC */
export interface CharityGrowthRow {
  period: string;
  newRegistrations: number;
  approved: number;
  rejected: number;
  active: number;
  suspended: number;
}

/** Raw database row from admin_charity_growth_report RPC (snake_case) */
export interface CharityGrowthRawRow {
  period: string;
  new_registrations: number;
  approved: number;
  rejected: number;
  active: number;
  suspended: number;
}

/** A single row from the admin_donor_activity_report RPC */
export interface DonorActivityRow {
  period: string;
  newDonors: number;
  activeDonors: number;
  dormantDonors: number;
  avgDonationUsd: number;
  repeatDonorRate: number;
}

/** Raw database row from admin_donor_activity_report RPC (snake_case) */
export interface DonorActivityRawRow {
  period: string;
  new_donors: number;
  active_donors: number;
  dormant_donors: number;
  avg_donation_usd: number;
  repeat_donor_rate: number;
}

/** A single row from the admin_volunteer_report RPC */
export interface VolunteerReportRow {
  period: string;
  hoursSubmitted: number;
  hoursValidated: number;
  hoursRejected: number;
  rejectionRate: number;
  avgValidationDays: number;
}

/** Raw database row from admin_volunteer_report RPC (snake_case) */
export interface VolunteerReportRawRow {
  period: string;
  hours_submitted: number;
  hours_validated: number;
  hours_rejected: number;
  rejection_rate: number;
  avg_validation_days: number;
}

/** A single metric row from the admin_platform_health_summary RPC */
export interface PlatformHealthRow {
  metric: string;
  value: number;
  trend7d: number | null;
  trend30d: number | null;
  unit: string;
}

/** Raw database row from admin_platform_health_summary RPC (snake_case) */
export interface PlatformHealthRawRow {
  metric: string;
  value: number;
  trend_7d: number | null;
  trend_30d: number | null;
  unit: string;
}

/** Supported period presets for platform health summary */
export type PlatformHealthPeriod = "7d" | "30d" | "90d";
