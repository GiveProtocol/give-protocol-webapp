import React from 'react';
import { DollarSign, Clock, Award } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useTranslation } from '@/hooks/useTranslation';

interface DonationStatsProps {
  stats?: {
    totalDonated: number;
    volunteerHours: number;
    skillsEndorsed: number;
  };
  isPersonal?: boolean;
}

export const DonationStats: React.FC<DonationStatsProps> = ({ stats, isPersonal }) => {
  const { t } = useTranslation();
  
  if (!stats) return null;

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <DollarSign className="h-6 w-6 text-indigo-600 p-3 rounded-full bg-indigo-100" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">
            {isPersonal 
              ? t('dashboard.yourTotalDonated', 'Your Total Donated') 
              : t('dashboard.totalDonations')}
          </p>
          <p className="text-2xl font-semibold text-gray-900">
            <CurrencyDisplay amount={stats.totalDonated} />
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <Clock className="h-6 w-6 text-green-600 p-3 rounded-full bg-green-100" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">
            {isPersonal 
              ? t('dashboard.yourVolunteerHours', 'Your Volunteer Hours') 
              : t('dashboard.volunteerHours')}
          </p>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.volunteerHours.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <Award className="h-6 w-6 text-purple-600 p-3 rounded-full bg-purple-100" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">
            {isPersonal 
              ? t('dashboard.yourSkillsEndorsed', 'Your Skills Endorsed') 
              : t('dashboard.skillsEndorsed')}
          </p>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.skillsEndorsed.toLocaleString()}
          </p>
        </div>
      </div>
    </>
  );
};