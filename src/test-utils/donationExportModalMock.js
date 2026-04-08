// Mock for @/components/contribution/DonationExportModal
// Renders both data-testid values used across different test suites.
// When isOpen is explicitly false the modal is hidden.
export const DonationExportModal = ({ isOpen, onClose }) => {
  if (isOpen === false) return null;
  return (
    <div data-testid="export-modal">
      <div data-testid="donation-export-modal">
        Export Modal
        <button onClick={onClose}>Close Export</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
