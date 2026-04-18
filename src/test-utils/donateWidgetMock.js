// Mock for @/components/charity/DonateWidget
// Renders a simple div with data-testid for assertions.
export const DonateWidget = ({
  ein: _ein,
  charityName: _charityName,
  walletAddress: _walletAddress,
  charityId: _charityId,
  mode: _mode,
  isVerified: _isVerified,
}) => <div data-testid="donate-widget">Donate Widget</div>;
