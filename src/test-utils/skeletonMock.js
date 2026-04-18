// Mock for @/components/ui/Skeleton
// Renders a simple div with data-testid for assertions.
export const Skeleton = ({ className, height, width, ...props }) => (
  <div
    data-testid="skeleton"
    className={className}
    style={{ height, width }}
    {...props}
  />
);
