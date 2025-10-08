import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DonorRegistration } from '../components/auth/DonorRegistration';
import { CharityVettingForm } from '../components/auth/CharityVettingForm';
import { Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/Logo';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const [userType, setUserType] = useState<'donor' | 'charity'>(typeParam === 'charity' ? 'charity' : 'donor');

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
  }, []);

  const handleCharityClick = useCallback(() => {
    setUserType('charity');
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center mb-4">
            <Logo className="h-12 w-12" />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to={`/login?type=${userType}`} className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <Button
            onClick={handleDonorClick}
            variant="secondary"
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
              userType === 'donor'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-5 w-5 mr-2" />
            Donor Account
          </Button>
          <Button
            onClick={handleCharityClick}
            variant="secondary"
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
              userType === 'charity'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="h-5 w-5 mr-2" />
            Charity Account
          </Button>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-6 text-center">
            {userType === 'donor' ? 'Create Donor Account' : 'Register Charity Organization'}
          </h3>
          {userType === 'donor' ? <DonorRegistration /> : <CharityVettingForm />}
        </div>
      </div>
    </div>
  );
};

export default Register;