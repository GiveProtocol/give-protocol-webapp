import React from 'react';
import { CharityCard } from '@/components/charity/CharityCard';
import { DonationButton } from '@/components/web3/donation/DonationButton';
import { formatCurrency } from '@/utils/money';

const PORTFOLIO = {
  id: '3',
  name: 'Education Impact Fund',
  description: 'Advancing educational opportunities and access to quality learning worldwide through innovative programs and initiatives.',
  category: 'Education',
  totalDonated: 920000,
  image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800'
};

const CHARITIES = [
  {
    id: '11',
    name: 'Global Education Access',
    description: 'Providing education opportunities in underserved communities',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800',
    verified: true,
    country: 'United States',
    causes: []
  },
  {
    id: '12',
    name: 'Digital Learning Initiative',
    description: 'Bridging the digital divide in education through technology',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1584697964358-3e14ca57658b?auto=format&fit=crop&w=800',
    verified: true,
    country: 'Rwanda',
    causes: []
  },
  {
    id: '13',
    name: 'Teachers Without Borders',
    description: 'Supporting educator development in remote regions',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800',
    verified: true,
    country: 'Global',
    causes: []
  },
  {
    id: '14',
    name: 'Girls Education Fund',
    description: 'Promoting equal access to education for girls worldwide',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800',
    verified: true,
    country: 'India',
    causes: []
  },
  {
    id: '15',
    name: 'STEM Education Alliance',
    description: 'Advancing science and technology education in developing nations',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800',
    verified: true,
    country: 'Multiple',
    causes: []
  }
];

const EducationPortfolioDetail: React.FC = () => {
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
          Supported Education Organizations
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

export default EducationPortfolioDetail;