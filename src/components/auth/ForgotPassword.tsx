import React from 'react';
import { ForgotCredentials } from './ForgotCredentials';

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  return <ForgotCredentials type="password" onBack={onBack} />;
};