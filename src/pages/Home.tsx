import React from 'react';
import { FeatureCards } from '@/components/home/FeatureCards';
import { Hero } from '@/components/home/Hero';
import { ActionButtons } from '@/components/home/ActionButtons';
import { ProtocolStats } from '@/components/home/ProtocolStats';

const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <Hero />
        <ProtocolStats />
        <FeatureCards />
        <ActionButtons />
      </div>
    </div>
  );
};

export default Home;