import React from 'react';
import { CharityCard } from '@/components/charity/CharityCard';
import { DonationButton } from '@/components/web3/donation/DonationButton';
import { formatCurrency } from '@/utils/money';

const PORTFOLIO = {
  id: '2',
  name: 'Poverty Relief Impact Fund',
  description: 'Empowering communities through sustainable poverty alleviation programs and initiatives that create lasting change.',
  category: 'Poverty Relief',
  totalDonated: 850000,
  image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800'
};

const CHARITIES = [
  {
    id: '6',
    name: 'Global Hunger Initiative',
    description: 'Combating food insecurity and malnutrition in vulnerable communities',
    category: 'Poverty Relief',
    image: 'https://images.unsplash.com/photo-1459183885421-5cc683b8dbba?auto=format&fit=crop&w=800',
    verified: true,
    country: 'United States',
    causes: []
  },
  {
    id: '7',
    name: 'Microfinance Empowerment Fund',
    description: 'Providing microloans to entrepreneurs in developing regions',
    category: 'Poverty Relief',
    image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=800',
    verified: true,
    country: 'Bangladesh',
    causes: []
  },
  {
    id: '8',
    name: 'Housing for Humanity',
    description: 'Building affordable housing for families in need',
    category: 'Poverty Relief',
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800',
    verified: true,
    country: 'Mexico',
    causes: []
  },
  {
    id: '9',
    name: 'Community Development Alliance',
    description: 'Supporting sustainable community development projects',
    category: 'Poverty Relief',
    image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800',
    verified: true,
    country: 'Kenya',
    causes: []
  },
  {
    id: '10',
    name: 'Economic Opportunity Fund',
    description: 'Creating pathways to economic independence through job training',
    category: 'Poverty Relief',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800',
    verified: true,
    country: 'India',
    causes: []
  }
];

const PovertyPortfolioDetail: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative h-64 rounded-xl overflow-hidden mb-6">
        <img
            src={PORTFOLIO.image}
            alt={PORTFOLIO.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{PORTFOLIO.name}</h1>
            <p className="text-lg opacity-90">{PORTFOLIO.description}</p>
          </div>
        </div>

      <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500">Total Donated</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(PORTFOLIO.totalDonated)}
            </p>
          </div>
          <div className="w-1/2">
            <DonationButton
              charityName={PORTFOLIO.name}
              charityAddress={PORTFOLIO.id}
              buttonText="Donate to Fund"
            />
          </div>
        </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Supported Poverty Relief Organizations
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CHARITIES.map((charity) => (
            <CharityCard key={charity.id} charity={charity} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PovertyPortfolioDetail;