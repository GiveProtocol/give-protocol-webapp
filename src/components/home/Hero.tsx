import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const GRADIENT_KEYWORD = 'generosity.';

/** Hero section with gradient-highlighted tagline and subtitle text. */
export const Hero: React.FC = () => {
  const { t } = useTranslation();
  const tagline = t('app.tagline');
  const idx = tagline.lastIndexOf(GRADIENT_KEYWORD);

  return (
    <>
      <h1 className="text-4xl font-bold sm:text-6xl leading-tight tracking-tight">
        {idx > -1 ? (
          <>
            <span className="text-gray-900">{tagline.slice(0, idx)}</span>
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">{GRADIENT_KEYWORD}</span>
          </>
        ) : (
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">{tagline}</span>
        )}
      </h1>
      <p className="mt-4 text-xl text-gray-600">
        {t('home.subtitle', 'Connecting resources to the causes that need them most')}
      </p>
    </>
  );
};
