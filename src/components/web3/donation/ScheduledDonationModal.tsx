import React, { useCallback } from 'react';
import { ScheduledDonationForm } from './ScheduledDonationForm';
import { TransactionModal } from '@/components/web3/common/TransactionModal';

interface ScheduledDonationModalProps {
  charityName: string;
  charityAddress: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ScheduledDonationModal: React.FC<ScheduledDonationModalProps> = ({
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
      title={`Schedule Monthly Donations to ${charityName}`}
      onClose={onClose}
    >
      <ScheduledDonationForm
        charityAddress={charityAddress}
        charityName={charityName}
        onSuccess={handleSuccess}
        onClose={onClose}
      />
    </TransactionModal>
  );
};