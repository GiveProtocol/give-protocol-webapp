// Mock for @/components/volunteer/OpportunityForm
// jest.mock() for this path does not intercept ESM imports in Jest 30 + ts-jest,
// so it is mapped globally via moduleNameMapper in jest.config.mjs.
// Provides Save / Cancel Form buttons so OpportunityManagement tests can
// assert form open/close behaviour without needing a real Router context.
export const OpportunityForm = ({ onSuccess, onCancel }) => (
  <div data-testid="opportunity-form">
    <span>Add Opportunity</span>
    <button onClick={onSuccess}>Save</button>
    <button onClick={onCancel}>Cancel Form</button>
  </div>
);
