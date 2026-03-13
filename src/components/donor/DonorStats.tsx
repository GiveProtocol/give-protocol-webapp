import React from 'react';
import { PiggyBank, TrendingUp, Heart } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useTranslation } from '@/hooks/useTranslation';

interface DonorStatsProps {
  totalDonated: number;
  impactGrowth: number;
  charitiesSupported: number;
}

/**
 * DonorStats component displays the donor's total donations, impact growth, and number of charities supported.
 *
 * @param totalDonated - Total amount donated by the donor.
 * @param impactGrowth - The increase in impact value.
 * @param charitiesSupported - Count of charities supported by the donor.
 * @returns A React element rendering donor statistics.
 */
export const DonorStats: React.FC<DonorStatsProps> = ({
  totalDonated,
  impactGrowth,
  charitiesSupported
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 mb-8 md:grid-cols-3">
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <PiggyBank className="h-6 w-6 text-emerald-600 p-3 rounded-full bg-emerald-100" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{t('dashboard.totalDonations')}</p>
          <p className="text-2xl font-semibold text-gray-900">
            <CurrencyDisplay amount={totalDonated} />
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <TrendingUp className="h-6 w-6 text-green-600 p-3 rounded-full bg-green-100" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{t('dashboard.impactGrowth', 'Impact Growth')}</p>
          <p className="text-2xl font-semibold text-gray-900">
            <CurrencyDisplay amount={impactGrowth} />
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <Heart className="h-6 w-6 text-emerald-600 p-3 rounded-full bg-emerald-100" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{t('dashboard.charitiesSupported', 'Charities Supported')}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {charitiesSupported}
          </p>
        </div>
      </div>
    </div>
  );
};