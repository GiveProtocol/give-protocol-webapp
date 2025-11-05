import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { AppNavbar } from '@/components/AppNavbar';
import { Footer } from '@/components/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Landing page has its own navigation and footer, so render without layout wrapper
  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
      <AppNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};