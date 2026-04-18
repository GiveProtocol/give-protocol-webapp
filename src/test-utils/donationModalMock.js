// Mock for @/components/web3/donation/DonationModal
// Renders a simple div with data-testid for assertions.
export const DonationModal = ({
  charityName: _charityName,
  charityAddress: _charityAddress,
  charityId: _charityId,
  frequency: _frequency,
  onClose: _onClose,
}) => <div data-testid="donation-modal">Donation Modal</div>;
