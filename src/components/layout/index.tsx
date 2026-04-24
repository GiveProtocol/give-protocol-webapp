import React from "react";
import { useLocation } from "react-router-dom";
import { AppNavbar } from "@/components/AppNavbar";
import { Footer } from "@/components/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * App shell that wraps routed pages with the navbar, main content area, and footer.
 * The home route ("/") opts out of the shell because it ships its own full-page layout.
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Landing page has its own navigation and footer, so render without layout wrapper
  if (isHomePage) {
    return children;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppNavbar />
      <main className="flex-grow w-full max-w-[1440px] mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};
