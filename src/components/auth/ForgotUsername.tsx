import React from 'react';
import { ForgotCredentials } from './ForgotCredentials';

interface ForgotUsernameProps {
  onBack: () => void;
}

export const ForgotUsername: React.FC<ForgotUsernameProps> = ({ onBack }) => {
  return <ForgotCredentials type="username" onBack={onBack} />;
};