import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';

interface TranslatedTextProps {
  i18nKey: string;
  values?: Record<string, string | number>;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  i18nKey,
  values,
  className,
  as: Component = 'span'
}) => {
  const { t } = useTranslation();
  
  return (
    <Component className={cn(className)}>
      {t(i18nKey, values)}
    </Component>
  );
};