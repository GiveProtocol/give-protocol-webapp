import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Award, Users } from 'lucide-react';

interface VolunteerStats {
  totalHours: number;
  skillsEndorsed: number;
  organizationsHelped: number;
  recentAchievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  organization: string;
  date: string;
}

const fetchVolunteerStats = async (): Promise<VolunteerStats> => {
  // Simulated API call
  return {
    totalHours: 156,
    skillsEndorsed: 12,
    organizationsHelped: 5,
    recentAchievements: [
      {
        id: '1',
        title: 'Web Development Project',
        organization: 'Tech for Good',
        date: '2024-03-15'
      },
      {
        id: '2',
        title: 'Environmental Campaign',
        organization: 'Green Earth',
        date: '2024-03-10'
      }
    ]
  };
};

export const VolunteerImpact: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['volunteerStats'],
    queryFn: fetchVolunteerStats
  });

  if (isLoading) return <div>Loading volunteer stats&hellip;</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Clock className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {stats?.totalHours}
          </p>
          <p className="text-sm text-gray-500">Hours</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center">
            <Award className="h-8 w-8 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {stats?.skillsEndorsed}
          </p>
          <p className="text-sm text-gray-500">Skills Endorsed</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {stats?.organizationsHelped}
          </p>
          <p className="text-sm text-gray-500">Organizations</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          {stats?.recentAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{achievement.title}</p>
                <p className="text-sm text-gray-500">{achievement.organization}</p>
              </div>
              <span className="text-sm text-gray-500">{achievement.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};