import React from "react";
import { DollarSign, Clock, Users, Award } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/utils/money";
import { useGlobalContributionStats } from "@/hooks/useContributionStats";

export const GlobalStats: React.FC = () => {
  const { data: stats, isLoading } = useGlobalContributionStats();

  // Show loading skeleton while fetching
  if (isLoading) {
    return (
      <div className="grid gap-6 mb-8 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 flex items-center animate-pulse">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="ml-4 space-y-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 mb-8 md:grid-cols-4">
      <Card className="p-6 flex items-center">
        <DollarSign className="h-12 w-12 p-3 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Donated
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {stats?.totalDonationAmount
              ? formatCurrency(stats.totalDonationAmount)
              : "$0"}
          </p>
        </div>
      </Card>

      <Card className="p-6 flex items-center">
        <Users className="h-12 w-12 p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Active Volunteers
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {stats?.totalVolunteers?.toLocaleString() || "0"}
          </p>
        </div>
      </Card>

      <Card className="p-6 flex items-center">
        <Clock className="h-12 w-12 p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Volunteer Hours
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {stats?.totalVolunteerHours?.toLocaleString() || "0"}
          </p>
        </div>
      </Card>

      <Card className="p-6 flex items-center">
        <Award className="h-12 w-12 p-3 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Skills Endorsed
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {stats?.totalSkillsEndorsed?.toLocaleString() || "0"}
          </p>
        </div>
      </Card>
    </div>
  );
};
