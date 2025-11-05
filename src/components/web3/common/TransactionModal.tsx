import React from 'react';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface TransactionModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  title,
  onClose,
  children
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {title}
          </h2>
          {children}
        </div>
      </Card>
    </div>
  );
};