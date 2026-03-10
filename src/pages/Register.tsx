import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DonorRegistration } from '../components/auth/DonorRegistration';
import { CharityVettingForm } from '../components/auth/CharityVettingForm';
import { IrsOrganizationSearch } from '../components/auth/IrsOrganizationSearch';
import { CharityClaimForm } from '../components/auth/CharityClaimForm';
import { ShieldCheck } from 'lucide-react';
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
