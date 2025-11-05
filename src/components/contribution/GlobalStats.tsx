import React from 'react';
import { DollarSign, Clock, Users, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/money';

export const GlobalStats: React.FC = () => {
  // Sample data - replace with real API data
  const stats = {
    totalDonated: 1245392,
    totalVolunteers: 3427,
    totalHours: 24568,
    totalSkills: 156
  };

  return (
    <div className="grid gap-6 mb-8 md:grid-cols-4">
      <Card className="p-6 flex items-center">
        <DollarSign className="h-6 w-6 p-3 rounded-full bg-indigo-100 text-indigo-600" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Total Donated</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatCurrency(stats.totalDonated)}
          </p>
        </div>
      </Card>

      <Card className="p-6 flex items-center">
        <Users className="h-6 w-6 p-3 rounded-full bg-green-100 text-green-600" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.totalVolunteers.toLocaleString()}
          </p>
        </div>
      </Card>

      <Card className="p-6 flex items-center">
        <Clock className="h-6 w-6 p-3 rounded-full bg-purple-100 text-purple-600" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Volunteer Hours</p>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.totalHours.toLocaleString()}
          </p>
        </div>
      </Card>

      <Card className="p-6 flex items-center">
        <Award className="h-6 w-6 p-3 rounded-full bg-amber-100 text-amber-600" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Skills Endorsed</p>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.totalSkills.toLocaleString()}
          </p>
        </div>
      </Card>
    </div>
  );
};