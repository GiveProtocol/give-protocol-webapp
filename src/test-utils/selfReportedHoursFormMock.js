// Mock for SelfReportedHoursForm component
export const SelfReportedHoursForm = ({ onSubmit, onCancel, isEdit, isLoading }) => (
  <div data-testid="self-reported-hours-form">
    <span>{isEdit ? "Edit Form" : "Create Form"}</span>
    {isLoading && <span>Submitting...</span>}
    <button onClick={() => onSubmit({ activityDate: "2024-01-15", hours: 4, activityType: "direct_service", description: "Test" })}>
      Submit
    </button>
    <button onClick={onCancel}>Cancel</button>
  </div>
);
