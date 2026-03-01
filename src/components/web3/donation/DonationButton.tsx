import React, { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { DonationModal } from './DonationModal';
import { Button } from '@/components/ui/Button';

interface DonationButtonProps {
  charityName: string;
  charityAddress: string;
  /** Optional charity ID for payment metadata (defaults to charityAddress) */
  charityId?: string;
  buttonText?: string;
  /** Custom render function for the trigger element. Receives an onClick handler. */
  renderTrigger?: (_props: { onClick: () => void }) => React.ReactNode;
  onSuccess?: () => void;
}

export const DonationButton: React.FC<DonationButtonProps> = ({
  charityName,
  charityAddress,
  charityId,
  buttonText = "Give Once",
  renderTrigger,
  onSuccess
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ onClick: handleOpenModal })
      ) : (
        <Button
          icon={<Heart className="w-4 h-4" />}
          onClick={handleOpenModal}
          className="w-full flex items-center justify-center"
        >
          {buttonText}
        </Button>
      )}

      {showModal && (
        <DonationModal
          charityName={charityName}
          charityAddress={charityAddress}
          charityId={charityId || charityAddress}
          frequency="once"
          onClose={handleCloseModal}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};
