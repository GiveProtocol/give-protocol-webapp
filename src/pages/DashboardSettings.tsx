import React from 'react';
import { Settings } from 'lucide-react';
import { WalletLinkCard } from '@/components/wallet/WalletLinkCard';
import { WalletAliasSettings } from '@/components/settings/WalletAliasSettings';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

/** Dashboard settings page with wallet linking and account preferences. */
const DashboardSettings: React.FC = () => {
  const { user, email, authMethod } = useUnifiedAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
        </div>
      </div>

      {/* Account info */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Account</h3>
        <div className="space-y-2 text-sm">
          {email && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
              <span className="text-gray-900 dark:text-white">{email}</span>
            </div>
          )}
          {user?.displayName && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Display name</span>
              <span className="text-gray-900 dark:text-white">{user.displayName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Auth method</span>
            <span className="text-gray-900 dark:text-white capitalize">{authMethod ?? 'email'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Role</span>
            <span className="text-gray-900 dark:text-white capitalize">{user?.role ?? 'donor'}</span>
          </div>
        </div>
      </div>

      {/* Wallet linking */}
      <div className="mb-6">
        <WalletLinkCard />
      </div>

      {/* Wallet alias settings */}
      <WalletAliasSettings />
    </div>
  );
};

export default DashboardSettings;
