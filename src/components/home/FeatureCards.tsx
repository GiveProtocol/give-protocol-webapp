import React from 'react';
import { Heart, TrendingUp, Globe } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: Heart,
    title: 'Donation & Volunteer Tracking',
    description: 'Track Your Impact All in One Place'
  },
  {
    icon: TrendingUp,
    title: 'Equity Pools',
    description: 'Contribute to growing crypto asset funds'
  },
  {
    icon: Globe,
    title: 'Portfolio Funds',
    description: 'Broadly Support Charitable Sectors without needing Split Gifts'
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