import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
        {t('app.tagline')}
      </h1>
      <p className="mt-4 text-xl text-gray-600">
        {t('home.subtitle', 'Join the future of charitable giving with transparent, efficient, and impactful donations')}
      </p>
    </>
  );
};