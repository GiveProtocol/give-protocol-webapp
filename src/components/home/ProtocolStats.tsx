import React from 'react';
import { DollarSign, Hash } from 'lucide-react';

export const ProtocolStats: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto mt-12 mb-16">
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center">
        <DollarSign className="h-6 w-6 text-gray-700 p-3 rounded-full bg-gray-100" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Total Value Donated</p>
          <p className="text-2xl font-semibold text-gray-900">$1,245,392</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center">
        <Hash className="h-6 w-6 text-gray-700 p-3 rounded-full bg-gray-100" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Total Donations</p>
          <p className="text-2xl font-semibold text-gray-900">3,427</p>
        </div>
      </div>
    </div>
  );
};