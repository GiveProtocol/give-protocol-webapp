// Shared TypeScript interfaces for test components
// This file eliminates duplication of component prop types across test files

import React from "react";

/**
 * Base interface for all mock UI components with common HTML attributes
 */
export interface MockUIComponentProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: string;
  disabled?: boolean;
  type?: string;
  value?: string;
  onChange?: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  [key: string]: unknown;
}

/**
 * Legacy type aliases for backward compatibility - use subset of base interface
 */
export type MockButtonProps = Pick<
  MockUIComponentProps,
  "children" | "onClick" | "variant" | "disabled" | "className" | "type"
>;
export type MockInputProps = Pick<
  MockUIComponentProps,
  "value" | "onChange" | "placeholder" | "type"
>;
export type MockCardProps = Pick<
  MockUIComponentProps,
  "children" | "className"
>;

/**
 * Common interface for mock auth hook return type
 */
export interface MockAuthReturn {
  user: { id: string } | null;
  userType: string | null;
  signOut: jest.Mock;
  loading: boolean;
}

/**
 * Common interface for mock web3 hook return type
 */
export interface MockWeb3Return {
  address: string | null;
  isConnected: boolean;
}

/**
 * Common interface for mock profile hook return type
 */
export interface MockProfileReturn {
  profile: { id: string; name?: string } | null;
  loading: boolean;
  error: string | null;
  refetch: jest.Mock;
}

/**
 * Common interface for mock translation hook return type
 */
export interface MockTranslationReturn {
  t: jest.Mock;
}

/**
 * Common interface for mock volunteer verification hook return type
 */
export interface MockVolunteerVerificationReturn {
  verifyHours: jest.Mock;
  acceptApplication: jest.Mock;
  loading: boolean;
  error: string | null;
}

/**
 * Props interface for mock DonationExportModal component
 */
export interface MockDonationExportModalProps {
  donations: Array<{
    id: string;
    amount: number;
    timestamp: string;
    [key: string]: unknown;
  }>;
  onClose: () => void;
}

/**
 * Props interface for components with onClose functionality
 */
export interface MockComponentWithClose {
  onClose: () => void;
}

/**
 * Props interface for components with donations prop
 */
export interface MockComponentWithDonations {
  donations: MockDonation[];
  onClose: () => void;
}

/**
 * Mock data interfaces
 */
export interface MockDonation {
  id: string;
  amount: string;
  donor_id: string;
  charity_id: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

export interface MockCharity {
  id: string;
  name: string;
  description: string;
  category: string;
  country: string;
  verified: boolean;
  created_at: string;
  [key: string]: unknown;
}

export interface MockUser {
  id: string;
  email: string;
  user_metadata: { user_type: string };
  app_metadata: Record<string, unknown>;
  aud: string;
  created_at: string;
  [key: string]: unknown;
}

/**
 * Supabase mock types
 */
export interface MockSupabaseQuery<T = unknown> {
  data: T[] | T | null;
  error: { message: string } | null;
}

export interface MockSupabaseOverrides {
  select?: Partial<MockSupabaseQuery>;
  selectEq?: Partial<MockSupabaseQuery>;
  insert?: Partial<MockSupabaseQuery>;
  update?: Partial<MockSupabaseQuery>;
  updateEq?: Partial<MockSupabaseQuery>;
  deleteEq?: Partial<MockSupabaseQuery>;
  from?: Record<string, unknown>;
  client?: Record<string, unknown>;
}

/**
 * Shared CSS class patterns for test assertions
 * Centralizes common styling patterns to reduce duplication
 */
export const cssClasses = {
  card: {
    default: ["bg-white", "border", "border-gray-200", "rounded-lg", "p-4"],
    success: ["bg-green-50", "border", "border-green-200", "rounded-lg", "p-4"],
    error: ["p-3", "bg-red-50", "text-red-700", "text-sm", "rounded-md"],
  },
  button: {
    primary: ["flex", "items-center"],
    secondary: ["flex", "items-center"],
  },
  spinner: {
    default: ["animate-spin"],
  },
};
