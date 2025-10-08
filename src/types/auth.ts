export type AuthErrorCode = 
  | 'invalid_credentials'
  | 'email_taken'
  | 'weak_password'
  | 'invalid_email'
  | 'network_error';

export interface AuthError extends Error {
  code: AuthErrorCode;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
  } | null;
  session: unknown | null;
}

export type UserType = 'donor' | 'charity';

export interface UserProfile {
  id: string;
  user_id: string;
  type: UserType;
  created_at: string;
}