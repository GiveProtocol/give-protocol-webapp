import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { PortfolioFund } from '../../types/charity';
import { formatCurrency } from '../../utils/money';
import { DonationButton } from '../web3/donation/DonationButton';

interface PortfolioGridProps {
  searchTerm: string;
  category: string;
}

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({ searchTerm, category }) => {
  // Sample portfolio funds - replace with actual data fetching
  const portfolios: PortfolioFund[] = [
    {
      id: '1',
      name: 'Environmental Impact Fund',
      description: 'Supporting climate action and conservation projects',
      category: 'Environmental',
      totalDonated: 1000000,
      charities: ['1', '2', '3'],
      image: 'https://images.unsplash.com/photo-1498925008800-019c7d59d903?auto=format&fit=crop&w=800'
    },
    {
      id: '2',
      name: 'Poverty Relief Impact Fund',
      description: 'Empowering communities through sustainable poverty alleviation programs',
      category: 'Poverty Relief',
      totalDonated: 850000,
      charities: ['4', '5', '6'],
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800'
    },
    {
      id: '3',
      name: 'Education Impact Fund',
      description: 'Advancing educational opportunities and access to quality learning worldwide',
      category: 'Education',
      totalDonated: 920000,
      charities: ['7', '8', '9'],
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800'
    }
  ];

  const getPortfolioSlug = (name: string): string => {
    const category = name.split(' ')[0].toLowerCase();
    return category;
  };

  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesSearch = 
      portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || portfolio.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredPortfolios.map((portfolio) => (
        <Link key={portfolio.id} to={`/portfolio/${getPortfolioSlug(portfolio.name)}`}>
          <Card className="overflow-hidden h-full transition-transform hover:scale-[1.02]">
            <img
              src={portfolio.image}
              alt={portfolio.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-2">{portfolio.name}</h3>
              <p className="text-gray-600 mb-4">{portfolio.description}</p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Donated</p>
                  <p className="text-lg font-semibold text-gray-100">
                    {formatCurrency(portfolio.totalDonated)}
                  </p>
                </div>

                <DonationButton
                  charityName={portfolio.name}
                  charityAddress={portfolio.id}
                  buttonText="Donate to Fund"
                />
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};