import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DonorRegistration } from '../components/auth/DonorRegistration';
import { CharityVettingForm } from '../components/auth/CharityVettingForm';
import { IrsOrganizationSearch } from '../components/auth/IrsOrganizationSearch';
import { CharityClaimForm } from '../components/auth/CharityClaimForm';
import { ShieldCheck, Link as LinkIcon } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { formatAddress } from '@/components/Wallet/utils';
import { Logo } from '@/components/Logo';
import type { IrsOrganization } from '@/types/irsOrganization';

type CharityStep = 'search' | 'claim-form' | 'manual-form';

/**
 * Returns the heading text for the charity registration sub-step.
 * @param step - The current charity registration step
 * @returns The heading string
 */
function getCharityHeading(step: CharityStep): string {
  switch (step) {
    case 'search':
      return 'Find Your Organization';
    case 'claim-form':
      return 'Claim Your Organization';
    case 'manual-form':
      return 'Register Charity Organization';
  }
}

/**
 * Account registration page for donors and charities
 * @returns Register page element
 */
export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const [userType, setUserType] = useState<'donor' | 'charity'>(typeParam === 'charity' ? 'charity' : 'donor');
  const [charityStep, setCharityStep] = useState<CharityStep>('search');
  const [selectedOrg, setSelectedOrg] = useState<IrsOrganization | null>(null);
  const [linkWallet, setLinkWallet] = useState(true);

  const { address, isConnected } = useWeb3();
  const truncatedAddress = address ? formatAddress(address, 'short') : '';

  // Set user type based on URL parameter on mount and when it changes
  useEffect(() => {
    if (typeParam === 'charity') {
      setUserType('charity');
    } else if (typeParam === 'donor') {
      setUserType('donor');
    }
  }, [typeParam]);

  const handleDonorClick = useCallback(() => {
    setUserType('donor');
    setCharityStep('search');
    setSelectedOrg(null);
  }, []);

  const handleCharityClick = useCallback(() => {
    setUserType('charity');
  }, []);

  const handleOrganizationSelect = useCallback((org: IrsOrganization) => {
    setSelectedOrg(org);
    setCharityStep('claim-form');
  }, []);

  const handleSkipSearch = useCallback(() => {
    setCharityStep('manual-form');
  }, []);

  const handleBackToSearch = useCallback(() => {
    setSelectedOrg(null);
    setCharityStep('search');
  }, []);

  const handleLinkWalletToggle = useCallback(() => {
    setLinkWallet((prev) => !prev);
  }, []);

  const renderCharityContent = () => {
    switch (charityStep) {
      case 'search':
        return (
          <IrsOrganizationSearch
            onOrganizationSelect={handleOrganizationSelect}
            onSkip={handleSkipSearch}
          />
        );
      case 'claim-form':
        if (!selectedOrg) return null;
        return (
          <CharityClaimForm
            organization={selectedOrg}
            onBack={handleBackToSearch}
          />
        );
      case 'manual-form':
        return <CharityVettingForm />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left sidebar */}
      <div className="hidden lg:flex lg:w-[480px] bg-slate-900 relative flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-slate-900 to-slate-900" />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-16" aria-label="Go to homepage">
            <Logo className="h-10 w-10" />
            <span className="text-white text-lg font-semibold tracking-tight">Give Protocol</span>
          </Link>
          <h2 className="font-serif text-4xl text-white leading-tight mb-6">
            Smart giving,<br />transparent impact.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Blockchain-powered charitable giving with full transparency, accountability, and real-time impact tracking.
          </p>
          {isConnected && address && (
            <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <LinkIcon className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">
                    Wallet detected: {truncatedAddress}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Create an account to link this wallet and access your donation history,
                    CEF portfolio, and SBT credentials across sessions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="relative z-10" />
      </div>

      {/* Right form area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto px-6 py-12 lg:py-16">
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="Go to homepage">
              <Logo className="h-10 w-10" />
              <span className="text-gray-900 dark:text-white text-lg font-semibold tracking-tight">Give Protocol</span>
            </Link>
          </div>

          <h1 className="font-serif text-3xl text-gray-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Already have an account?{' '}
            <Link to={`/login?type=${userType}`} className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>

          {/* Segmented control */}
          <div className="bg-slate-100 dark:bg-gray-800 rounded-full p-1 flex mb-8" role="radiogroup" aria-label="Account type">
            <button
              type="button"
              role="radio"
              aria-checked={userType === 'donor'}
              onClick={handleDonorClick}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                userType === 'donor'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Donor
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={userType === 'charity'}
              onClick={handleCharityClick}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                userType === 'charity'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Charity
            </button>
          </div>

          {/* Wallet row */}
          {userType === 'donor' && isConnected && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Link wallet {truncatedAddress}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Auto-link your connected wallet to this account
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={linkWallet}
                  onClick={handleLinkWalletToggle}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    linkWallet ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                    linkWallet ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          )}
          {userType === 'donor' && !isConnected && (
            <div className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <LinkIcon className="h-5 w-5 text-slate-400 shrink-0" />
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  You can connect a wallet from your dashboard after signup.
                </p>
              </div>
            </div>
          )}
          {userType === 'charity' && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <LinkIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Organization wallet setup
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Charity digital asset wallets are configured after account creation
                    by an authorized admin using your organization&apos;s dedicated wallet —
                    kept separate from any personal wallets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              {userType === 'donor' ? 'Create Donor Account' : getCharityHeading(charityStep)}
            </h2>
            {userType === 'donor' ? <DonorRegistration /> : renderCharityContent()}
          </div>

          {/* Trust signal */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400 dark:text-gray-500">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            <span>256-bit SSL encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
