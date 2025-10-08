import React from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/utils/cn';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  className 
}) => {
  const { formatAmount } = useCurrency();
  
  return (
    <span className={cn(className)}>
      {formatAmount(amount)}
    </span>
  );
};