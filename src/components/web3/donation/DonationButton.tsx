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
  onSuccess?: () => void;
}

export const DonationButton: React.FC<DonationButtonProps> = ({
  charityName,
  charityAddress,
  charityId,
  buttonText = "Give Once",
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
      <Button
        icon={<Heart className="w-4 h-4" />}
        onClick={handleOpenModal}
        className="w-full flex items-center justify-center"
      >
        {buttonText}
      </Button>

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
