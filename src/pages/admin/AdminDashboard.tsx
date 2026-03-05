import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
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

/** Quick action button with title and description text. */
function QuickActionButton({ title, description, onClick }: {
  title: string;
  description: string;
  onClick?: () => void;
}): React.ReactElement {
  return (
    <button onClick={onClick} className="p-4 border rounded-lg hover:bg-gray-50 text-left">
      <span className="font-medium block mb-1">{title}</span>
      <span className="text-sm text-gray-500 block">{description}</span>
    </button>
  );
}

/** Single activity entry showing type badge, description, timestamp, and optional amount. */
function ActivityItem({ activity, formatRelativeTime, formatCurrency, getActivityLabel }: {
  activity: AdminStats['recentActivity'][number];
  formatRelativeTime: (_ts: string) => string;
  formatCurrency: (_amount: number) => string;
  getActivityLabel: (_type: string) => string;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between p-4 mb-4 border rounded-lg">
      <div className="flex-1">
        <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">{getActivityLabel(activity.type)}</span>
        <p className="font-medium text-gray-900">{activity.description}</p>
        <p className="text-sm text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
      </div>
      {activity.amount && (
        <p className="font-semibold text-green-600 text-right">{formatCurrency(activity.amount)}</p>
      )}
    </div>
  );
}

/** Admin dashboard page displaying platform statistics, recent activity, and quick actions. */
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  /** Formats a number as a USD currency string. */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  /** Converts an ISO timestamp to a human-readable relative time string. */
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

  /** Returns a display label for a given activity type. */
  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'donation':
        return 'Donation';
      case 'registration':
        return 'Registration';
      case 'verification':
        return 'Verification';
      default:
        return 'Activity';
    }
  };

  const handleNavigateImpactMetrics = useCallback(() => {
    navigate('/admin/impact-metrics');
  }, [navigate]);

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
            className="bg-blue-600 text-gray-900 px-4 py-2 rounded hover:bg-blue-700"
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
          className="bg-blue-600 text-gray-900 px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Overview - Flattened from 4 to 3 levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Total Donations</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Verified Charities</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCharities}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteers}</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {stats.recentActivity.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            formatRelativeTime={formatRelativeTime}
            formatCurrency={formatCurrency}
            getActivityLabel={getActivityLabel}
          />
        ))}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton title="View Reports" description="Generate detailed analytics" />
          <QuickActionButton title="Manage Charities" description="Review and approve organizations" />
          <QuickActionButton title="System Settings" description="Configure platform parameters" />
          <QuickActionButton title="Manage Impact Metrics" description="Configure impact calculator data" onClick={handleNavigateImpactMetrics} />
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;