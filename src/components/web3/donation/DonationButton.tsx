import React, { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { DonationModal } from './DonationModal';
import { TransactionButton } from '@/components/web3/common/TransactionButton';

interface DonationButtonProps {
  charityName: string;
  charityAddress: string;
  buttonText?: string;
  onSuccess?: () => void;
}

export const DonationButton: React.FC<DonationButtonProps> = ({
  charityName,
  charityAddress,
  buttonText = "Donate",
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
        icon={Heart}
        label={buttonText}
        onClick={handleOpenModal}
        className="w-full flex items-center justify-center"
      />

      {showModal && (
        <DonationModal
          charityName={charityName}
          charityAddress={charityAddress}
          onClose={handleCloseModal}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};