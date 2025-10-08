import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useWeb3 } from '../../../contexts/Web3Context';

// Import cn utility
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface TransactionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const TransactionButton: React.FC<TransactionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  disabled,
  className
}) => {
  const { isConnected } = useWeb3();

  return (
    <Button
      onClick={onClick}
      disabled={disabled || !isConnected}
      className={cn(
        "shadow-sm hover:shadow-md rounded-md transition-all duration-200",
        className
      )}
      icon={<Icon className="h-5 w-5" />}
    >
      <span>{label}</span>
    </Button>
  );
};