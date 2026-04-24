// Mock for @/components/auth/ForgotPassword
// Mirrors the real component which delegates to ForgotCredentials with type="password",
// rendering "Reset Password" as its heading.
export const ForgotPassword = ({ onBack }) => (
  <div data-testid="forgot-password">
    <h2>Reset Password</h2>
    <button type="button" onClick={onBack}>
      Back to sign in
    </button>
  </div>
);
