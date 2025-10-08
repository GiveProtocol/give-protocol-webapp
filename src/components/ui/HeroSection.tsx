import React from 'react';

interface HeroSectionProps {
  image: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  image,
  title,
  description,
  children
}) => {
  return (
    <div className="relative h-80 rounded-xl overflow-hidden mb-6 mx-4 sm:mx-6 lg:mx-8 mt-8">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-8 text-white">
        {children}
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-lg opacity-90">{description}</p>
      </div>
    </div>
  );
};