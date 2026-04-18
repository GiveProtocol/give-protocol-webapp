// Mock for @/components/layout/StaticPageLayout
// Renders title, subtitle, and children without animation or layout dependencies.
export const StaticPageLayout = ({
  title,
  subtitle,
  effectiveDate: _effectiveDate,
  children,
}) => (
  <div data-testid="static-page-layout">
    <h1>{title}</h1>
    {subtitle && <p>{subtitle}</p>}
    <div>{children}</div>
  </div>
);
