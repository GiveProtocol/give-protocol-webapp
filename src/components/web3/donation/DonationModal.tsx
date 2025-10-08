import React, { useCallback } from 'react';
import { DonationForm } from './DonationForm';
import { TransactionModal } from '@/components/web3/common/TransactionModal';

interface DonationModalProps {
  charityName: string;
  charityAddress: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  charityName,
  charityAddress,
  onClose,
  onSuccess
}) => {
  const handleSuccess = useCallback(() => {
    onSuccess?.();
    onClose();
  }, [onSuccess, onClose]);

  return (
    <TransactionModal
      title={`Donate to ${charityName}`}
      onClose={onClose}
    >
      <DonationForm
        charityAddress={charityAddress}
        onSuccess={handleSuccess}
      />
    </TransactionModal>
  );
};