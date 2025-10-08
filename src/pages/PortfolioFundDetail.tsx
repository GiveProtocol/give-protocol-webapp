import React from 'react';
import { useParams } from 'react-router-dom';
import { CharityCard } from '@/components/charity/CharityCard';
import { DonationButton } from '@/components/web3/donation/DonationButton';
import { formatCurrency } from '@/utils/money';

// Sample data - replace with actual API calls
const SAMPLE_PORTFOLIO = {
  id: '1',
  name: 'Environmental Impact Fund',
  description: 'Supporting climate action and conservation projects across multiple organizations focused on environmental conservation, renewable energy, and sustainable practices.',
  category: 'Environmental',
  totalDonated: 1000000,
  image: 'https://images.unsplash.com/photo-1498925008800-019c7d59d903?auto=format&fit=crop&w=800'
};

const SAMPLE_CHARITIES = [
  {
    id: '1',
    name: 'Ocean Conservation Alliance',
    description: 'Protecting marine ecosystems and promoting sustainable ocean practices',
    category: 'Environmental',
    image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800',
    verified: true,
    country: 'United States',
    causes: []
  },
  {
    id: '2',
    name: 'Rainforest Protection Initiative',
    description: 'Preserving rainforests and supporting indigenous communities',
    category: 'Environmental',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800',
    verified: true,
    country: 'Brazil',
    causes: []
  },
  {
    id: '3',
    name: 'Clean Energy Foundation',
    description: 'Accelerating the transition to renewable energy sources',
    category: 'Environmental',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800',
    verified: true,
    country: 'Germany',
    causes: []
  },
  {
    id: '4',
    name: 'Wildlife Conservation Trust',
    description: 'Protecting endangered species and their habitats',
    category: 'Environmental',
    image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=800',
    verified: true,
    country: 'Kenya',
    causes: []
  },
  {
    id: '5',
    name: 'Sustainable Agriculture Project',
    description: 'Promoting eco-friendly farming practices and food security',
    category: 'Environmental',
    image: 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=800',
    verified: true,
    country: 'India',
    causes: []
  }
];

const PortfolioFundDetail: React.FC = () => {
  const { id: _id } = useParams<{ id: string }>(); // Prefixed as unused
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="relative h-64 rounded-xl overflow-hidden mb-6 bg-black bg-opacity-40">
          <img
            src={SAMPLE_PORTFOLIO.image}
            alt={SAMPLE_PORTFOLIO.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{SAMPLE_PORTFOLIO.name}</h1>
            <p className="text-lg opacity-90">{SAMPLE_PORTFOLIO.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500">Total Donated</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(SAMPLE_PORTFOLIO.totalDonated)}
            </p>
          </div>
          <div className="w-1/2">
            <DonationButton
              charityName={SAMPLE_PORTFOLIO.name}
              charityAddress={SAMPLE_PORTFOLIO.id}
              buttonText="Donate to Fund"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Supported Organizations
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_CHARITIES.map((charity) => (
            <CharityCard key={charity.id} charity={charity} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioFundDetail;