import React from 'react';

interface StaticPageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  effectiveDate?: string;
}

export const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  effectiveDate 
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header section matching home page style */}
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-xl text-gray-600">
            {subtitle}
          </p>
        )}
        {effectiveDate && (
          <p className="mt-2 text-gray-500 italic">
            {effectiveDate}
          </p>
        )}
      </div>
      
      {/* Content with proper typography */}
      <div className="max-w-4xl mx-auto">
        <div className="prose prose-lg prose-gray max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-h1:text-3xl prose-h1:mb-8 prose-h1:text-center
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
          prose-p:mb-4 prose-p:leading-relaxed
          prose-ul:mb-4 prose-ul:pl-6
          prose-li:mb-0
          prose-strong:font-semibold prose-strong:text-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
};