import React from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Logger } from '@/utils/logger';

interface RouteTransitionProps {
  children: React.ReactNode;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const location = useLocation();

  React.useEffect(() => {
    // Log page views for analytics
    Logger.info('Page view', {
      path: location.pathname,
      timestamp: new Date().toISOString()
    });

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <div className="animate-fadeIn">
        {children}
      </div>
    </React.Suspense>
  );
};