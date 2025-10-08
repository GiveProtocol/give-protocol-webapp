import React from 'react';
import { CharityCard } from './CharityCard';
import { Charity } from '@/types/charity';
import { cn } from '@/utils/cn';

interface CharityGridProps {
  searchTerm: string;
  category: string;
  verifiedOnly: boolean;
  className?: string;
}

export const CharityGrid: React.FC<CharityGridProps> = ({
  searchTerm,
  category,
  verifiedOnly,
  className
}) => {
  // Sample charities - replace with actual data fetching
  const charities: Charity[] = [
    {
      id: '1',
      name: "Global Water Foundation",
      category: "Water & Sanitation",
      description: "Providing clean water solutions worldwide",
      image: "https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&w=800",
      verified: true,
      country: "United States",
      causes: []
    },
    {
      id: '2',
      name: "Education for All",
      category: "Education",
      description: "Supporting education in developing countries",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800",
      verified: true,
      country: "Kenya",
      causes: []
    },
    {
      id: '3',
      name: "Climate Action Now",
      category: "Environment",
      description: "Fighting climate change globally",
      image: "https://images.unsplash.com/photo-1498925008800-019c7d59d903?auto=format&fit=crop&w=800",
      verified: false,
      country: "United Kingdom",
      causes: []
    }
  ];

  const filteredCharities = charities.filter(charity => {
    const matchesSearch = charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         charity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || charity.category === category;
    const matchesVerified = !verifiedOnly || charity.verified;
    
    return matchesSearch && matchesCategory && matchesVerified;
  });

  if (filteredCharities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No charities found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      {filteredCharities.map((charity) => (
        <CharityCard key={charity.id} charity={charity} />
      ))}
    </div>
  );
};