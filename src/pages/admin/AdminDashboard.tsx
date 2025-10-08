import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
// import { supabase } from '@/lib/supabase'; // Unused import
import { trackEvent } from '@/lib/sentry';

interface AdminStats {
  totalUsers: number;
  totalDonations: number;
  totalCharities: number;
  totalVolunteers: number;
  recentActivity: Array<{
    id: string;
    type: 'donation' | 'registration' | 'verification';
    description: string;
    timestamp: string;
    amount?: number;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, these would be actual database queries
      // For now, we'll use mock data since the full backend might not be set up
      const mockStats: AdminStats = {
        totalUsers: 1250,
        totalDonations: 89,
        totalCharities: 23,
        totalVolunteers: 156,
        recentActivity: [
          {
            id: '1',
            type: 'donation',
            description: 'New donation to Education for All',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            amount: 250
          },
          {
            id: '2',
            type: 'registration',
            description: 'New charity registered: Ocean Cleanup Initiative',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
          },
          {
            id: '3',
            type: 'verification',
            description: 'Volunteer hours verified for Clean Water Project',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
          },
          {
            id: '4',
            type: 'donation',
            description: 'Large donation to Climate Action Now',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            amount: 1000
          }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(mockStats);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setError('Failed to load dashboard data. Please try again.');
      trackEvent('admin_dashboard_error', { 
        error: err instanceof Error ? err.message : String(err),
        userId: user?.id 
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAdminStats();
    trackEvent('admin_dashboard_viewed', { userId: user?.id });
  }, [user?.id, fetchAdminStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return '💰';
      case 'registration':
        return '📝';
      case 'verification':
        return '✅';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAdminStats}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={fetchAdminStats}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Overview - Flattened from 4 to 3 levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
          </div>
          <div className="text-2xl">👥</div>
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Donations</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
          </div>
          <div className="text-2xl">💰</div>
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Verified Charities</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCharities}</p>
          </div>
          <div className="text-2xl">🏛️</div>
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteers}</p>
          </div>
          <div className="text-2xl">🤝</div>
        </Card>
      </div>

      {/* Recent Activity - Flattened from 5 to 3 levels */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {stats.recentActivity.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-4 mb-4 border rounded-lg">
            <span className="text-2xl mr-4">{getActivityIcon(activity.type)}</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{activity.description}</p>
              <p className="text-sm text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
            </div>
            {activity.amount && (
              <p className="font-semibold text-green-600 text-right">{formatCurrency(activity.amount)}</p>
            )}
          </div>
        ))}
      </Card>

      {/* Quick Actions - Flattened to 3 levels */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <span className="text-2xl block mb-2">📊</span>
            <span className="font-medium block mb-1">View Reports</span>
            <span className="text-sm text-gray-500 block">Generate detailed analytics</span>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <span className="text-2xl block mb-2">🏛️</span>
            <span className="font-medium block mb-1">Manage Charities</span>
            <span className="text-sm text-gray-500 block">Review and approve organizations</span>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <span className="text-2xl block mb-2">⚙️</span>
            <span className="font-medium block mb-1">System Settings</span>
            <span className="text-sm text-gray-500 block">Configure platform parameters</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;