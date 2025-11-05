import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Cause } from '../../types/charity';
import { formatCurrency } from '../../utils/money';
import { DonationButton } from '../web3/donation/DonationButton';

interface CauseGridProps {
  searchTerm: string;
  category: string;
}

export const CauseGrid: React.FC<CauseGridProps> = ({ searchTerm, category }) => {
  // Sample causes - replace with actual data fetching
  const causes: Cause[] = [
    {
      id: '1',
      name: 'Clean Water Initiative',
      description: 'Providing clean water access to rural communities',
      targetAmount: 50000,
      raisedAmount: 25000,
      charityId: '1',
      category: 'Water & Sanitation',
      image: 'https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&w=800'
    },
    {
      id: '2',
      name: 'Education Access Program',
      description: 'Ensuring quality education for underprivileged children',
      targetAmount: 75000,
      raisedAmount: 45000,
      charityId: '2',
      category: 'Education',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800'
    },
    {
      id: '3',
      name: 'Reforestation Project',
      description: 'Restoring forest ecosystems and biodiversity',
      targetAmount: 100000,
      raisedAmount: 60000,
      charityId: '3',
      category: 'Environment',
      image: 'https://images.unsplash.com/photo-1498925008800-019c7d59d903?auto=format&fit=crop&w=800'
    }
  ];

  const getCauseSlug = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  const filteredCauses = causes.filter(cause => {
    const matchesSearch = cause.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cause.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || cause.category === category;
    return matchesSearch && matchesCategory;
  });

  if (filteredCauses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No causes found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredCauses.map((cause) => (
        <Link key={cause.id} to={`/causes/${getCauseSlug(cause.name)}`} className="block">
          <Card className="overflow-hidden">
            <img
              src={cause.image}
              alt={cause.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{cause.name}</h3>
              <p className="text-gray-600 mb-4">{cause.description}</p>
              
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Progress</span>
                <span>{formatCurrency(cause.raisedAmount)} of {formatCurrency(cause.targetAmount)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-indigo-600"
                  style={{ width: `${(cause.raisedAmount / cause.targetAmount) * 100}%` }}
                />
              </div>

              <DonationButton
                charityName={cause.name}
                charityAddress={cause.charityId}
              />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};