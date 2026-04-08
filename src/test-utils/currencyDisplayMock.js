// Mock for @/components/CurrencyDisplay
// Mapped via moduleNameMapper so tests get a predictable testid to query.
export const CurrencyDisplay = ({ amount }) => (
  <span data-testid="currency-display">${amount}</span>
);
