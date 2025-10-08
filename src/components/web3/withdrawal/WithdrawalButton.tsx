import React, { useState, useCallback } from 'react';
import { Wallet } from 'lucide-react';
import { WithdrawalModal } from './WithdrawalModal';
import { TransactionButton } from '../common/TransactionButton';

interface WithdrawalButtonProps {
  onSuccess?: () => void;
}

export const WithdrawalButton: React.FC<WithdrawalButtonProps> = ({ onSuccess }) => {
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
        icon={Wallet}
        label="Withdraw"
        onClick={handleOpenModal}
      />

      {showModal && (
        <WithdrawalModal
          onClose={handleCloseModal}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};