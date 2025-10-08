import React, { useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface TransactionFormProps {
  amount: string;
  onAmountChange: (_value: string) => void;
  onSubmit: (_e: React.FormEvent) => Promise<void>;
  loading: boolean;
  error?: string;
  submitLabel: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  amount,
  onAmountChange,
  onSubmit,
  loading,
  error,
  submitLabel
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onAmountChange(e.target.value);
  }, [onAmountChange]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      <Input
        label="Amount (ETH)"
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={handleChange}
        required
      />
      <Button
        type="submit"
        disabled={loading || !amount}
        className="w-full"
      >
        {loading ? 'Processing...' : submitLabel}
      </Button>
    </form>
  );
};