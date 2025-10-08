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

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      {isHomePage ? <Navbar /> : <AppNavbar />}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};