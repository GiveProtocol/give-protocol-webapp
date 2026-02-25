import React from 'react';

export const ProtocolStats: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto mt-12 mb-16">
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-semibold text-gray-900">3+</p>
        <p className="text-sm font-medium text-gray-600">Blockchain Networks Served</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-semibold text-gray-900">7</p>
        <p className="text-sm font-medium text-gray-600">Charitable Sectors Benefitted</p>
      </div>
    </div>
  );
};