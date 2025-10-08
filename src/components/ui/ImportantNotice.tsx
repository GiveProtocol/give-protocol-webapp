import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ImportantNoticeProps {
  children: React.ReactNode;
  variant?: 'warning' | 'info' | 'highlight';
}

export const ImportantNotice: React.FC<ImportantNoticeProps> = ({ 
  children, 
  variant = 'info' 
}) => {
  const baseClasses = "p-4 my-6 rounded-lg border-l-4";
  
  const variantClasses = {
    warning: "bg-yellow-50 border-yellow-400 text-yellow-800",
    info: "bg-blue-50 border-blue-400 text-blue-800", 
    highlight: "bg-gray-50 border-gray-400 text-gray-800"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      {variant === 'warning' && (
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{children}</div>
        </div>
      )}
      {variant !== 'warning' && children}
    </div>
  );
};