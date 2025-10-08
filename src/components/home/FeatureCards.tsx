import React from 'react';
import { Heart, TrendingUp, Globe } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: Heart,
    title: 'Direct Donations',
    description: 'Support NGOs directly with immediate impact'
  },
  {
    icon: TrendingUp,
    title: 'Equity Pools',
    description: 'Contribute to growing crypto asset funds'
  },
  {
    icon: Globe,
    title: 'Portfolio Funds',
    description: 'Support multiple NGOs in the same sector'
  }
];

export const FeatureCards: React.FC = () => {
  return (
    <div className="mt-12 grid gap-8 md:grid-cols-3">
      {features.map((feature) => (
        <FeatureCard
          key={feature.title}
          Icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </div>
  );
};