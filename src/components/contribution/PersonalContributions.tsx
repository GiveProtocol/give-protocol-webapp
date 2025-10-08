import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DonationStats } from './DonationStats';
import { RecentDonations } from './RecentDonations';
import { VolunteerImpact } from './VolunteerImpact';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PersonalStats {
  totalDonated: number;
  volunteerHours: number;
  skillsEndorsed: number;
}

const fetchPersonalStats = async (_filters: Record<string, unknown>): Promise<PersonalStats> => {
  // Simulated API call with filter-based data
  return {
    totalDonated: 5200,
    volunteerHours: 48,
    skillsEndorsed: 8
  };
};

interface PersonalContributionsProps {
  filters: Record<string, unknown>;
}

export const PersonalContributions: React.FC<PersonalContributionsProps> = ({ filters }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['personalStats', filters],
    queryFn: () => fetchPersonalStats(filters)
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DonationStats stats={stats} isPersonal />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <RecentDonations />
        <VolunteerImpact />
      </div>
    </div>
  );
};