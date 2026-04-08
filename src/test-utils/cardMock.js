// Mock for @/components/ui/Card
export const Card = ({ children, className, ...props }) => (
  <div className={className} data-testid="card" {...props}>{children}</div>
);
