// Mock for @/components/ui/FormInput
// Renders a plain input with placeholder for testing.
export const FormInput = ({ icon: _icon, ...props }) => (
  <div>
    <input {...props} />
  </div>
);
