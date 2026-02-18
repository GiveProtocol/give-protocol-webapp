// Basic Types
export type UUID = string;
export type Timestamp = number;
export type ISO8601Date = string;
export type URL = string;

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: ReadonlyDeep<T[P]>;
};

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Common Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMetadata {
  timestamp: Timestamp;
  requestId: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Common Query Types
export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface DateRange {
  startDate: Timestamp;
  endDate: Timestamp;
}