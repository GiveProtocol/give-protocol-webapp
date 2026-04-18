// Mock for @/components/volunteer/VolunteerApplicationForm
// Renders a simple div representing the application form for testing.
export const VolunteerApplicationForm = ({
  opportunityId: _opportunityId,
  opportunityTitle,
  charityId: _charityId,
  onClose,
  onSuccess: _onSuccess,
}) => (
  <div data-testid="volunteer-application-form">
    <span>Application for {opportunityTitle}</span>
    <button onClick={onClose}>Close</button>
  </div>
);
