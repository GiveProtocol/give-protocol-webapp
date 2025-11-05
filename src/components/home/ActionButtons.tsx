import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

export const ActionButtons: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-12 flex justify-center">
      <Link
        to="/give-dashboard"
        className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-gray-800 hover:bg-gray-900"
      >
        {t('home.startDonating', 'Start Donating')}
      </Link>
    </div>
  );
};