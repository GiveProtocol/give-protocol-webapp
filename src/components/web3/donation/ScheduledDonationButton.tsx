import React, { useState, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { ScheduledDonationModal } from './ScheduledDonationModal';
import { TransactionButton } from '@/components/web3/common/TransactionButton';

interface ScheduledDonationButtonProps {
  charityName: string;
  charityAddress: string;
  buttonText?: string;
  onSuccess?: () => void;
}

export const ScheduledDonationButton: React.FC<ScheduledDonationButtonProps> = ({
  charityName,
  charityAddress,
  buttonText = "Donate Monthly",
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
      <TransactionButton
        icon={Calendar}
        label={buttonText}
        onClick={handleOpenModal}
        className="w-full flex items-center justify-center"
      />

      {showModal && (
        <ScheduledDonationModal
          charityName={charityName}
          charityAddress={charityAddress}
          onClose={handleCloseModal}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};