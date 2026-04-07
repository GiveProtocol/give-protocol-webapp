// Mock for src/components/layout
// Provides data-testid="layout" so App.test.tsx can assert the layout rendered.
export const Layout = ({ children }) => (
  <div data-testid="layout">{children}</div>
);
