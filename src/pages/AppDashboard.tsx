import React from 'react';
import { FeatureCards } from '@/components/home/FeatureCards';
import { Hero } from '@/components/home/Hero';
import { ActionButtons } from '@/components/home/ActionButtons';
import { ProtocolStats } from '@/components/home/ProtocolStats';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const AppDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <div className="animate-fade-in-up">
          <Hero />
        </div>
        <ScrollReveal direction="up" delay={100}>
          <ProtocolStats />
        </ScrollReveal>
        <ScrollReveal direction="up" delay={200}>
          <FeatureCards />
        </ScrollReveal>
        <ScrollReveal direction="scale" delay={300}>
          <ActionButtons />
        </ScrollReveal>
      </div>
    </div>
  );
};

export default AppDashboard;
