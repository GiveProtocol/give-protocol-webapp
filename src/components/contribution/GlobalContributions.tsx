import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DonationStats } from './DonationStats';
import { DonationLeaderboard } from './DonationLeaderboard';
import { VolunteerLeaderboard } from './VolunteerLeaderboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface GlobalStats {
  totalDonated: number;
  volunteerHours: number;
  skillsEndorsed: number;
}

const fetchGlobalStats = async (_filters: Record<string, unknown>): Promise<GlobalStats> => {
  // Simulated API call with filter-based data
  return {
    totalDonated: 1245000,
    volunteerHours: 24500,
    skillsEndorsed: 1560
  };
};

interface GlobalContributionsProps {
  filters: Record<string, unknown>;
}

export const GlobalContributions: React.FC<GlobalContributionsProps> = ({ filters }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['globalStats', filters],
    queryFn: () => fetchGlobalStats(filters)
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DonationStats stats={stats} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Donation Leaderboard</h2>
          <DonationLeaderboard />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Volunteer Leaderboard</h2>
          <VolunteerLeaderboard />
        </div>
      </div>
    </div>
  );
};