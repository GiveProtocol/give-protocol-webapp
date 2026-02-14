import React, { useState, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { DonationModal } from './DonationModal';
import { Button } from '@/components/ui/Button';

interface ScheduledDonationButtonProps {
  charityName: string;
  charityAddress: string;
  /** Optional charity ID for payment metadata (defaults to charityAddress) */
  charityId?: string;
  buttonText?: string;
  onSuccess?: () => void;
}

export const ScheduledDonationButton: React.FC<ScheduledDonationButtonProps> = ({
  charityName,
  charityAddress,
  charityId,
  buttonText = "Give Monthly",
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
        icon={<Calendar className="w-4 h-4" />}
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
          frequency="monthly"
          onClose={handleCloseModal}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};
