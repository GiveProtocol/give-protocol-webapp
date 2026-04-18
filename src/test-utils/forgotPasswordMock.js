// Mock for @/components/auth/ForgotPassword
// Renders a simple placeholder with back button for testing.
export const ForgotPassword = ({ onBack }) => (
  <div data-testid="forgot-password">
    <h2>Forgot Password</h2>
    <button type="button" onClick={onBack}>
      Back to sign in
    </button>
  </div>
);
