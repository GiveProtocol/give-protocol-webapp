import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ Icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-center">
        <Icon className="h-12 w-12 text-gray-700" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-100">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
};