import React from "react";
import { FeatureCards } from "@/components/home/FeatureCards";
import { Hero } from "@/components/home/Hero";
import { ActionButtons } from "@/components/home/ActionButtons";
import { ProtocolStats } from "@/components/home/ProtocolStats";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FeaturedCharitiesCarousel } from "@/components/home/FeaturedCharitiesCarousel";

const BLOB_DELAY: React.CSSProperties = { animationDelay: "1s" };

/**
 * /app Discovery Hub. Switches between public, donor, and charity views based on the
 * current auth state. Admins are redirected to /admin.
 */
const AppDashboard: React.FC = () => {
  const { user, userType, loading } = useAuth();

  let content: React.ReactNode;
  if (loading) {
    content = <DiscoveryShellSkeleton />;
  } else if (userType === "admin") {
    return <Navigate to="/admin" replace />;
  } else if (!user) {
    content = <PublicDiscoveryView />;
  } else if (userType === "charity") {
    content = <CharityHubView />;
  } else {
    content = <DonorHubView />;
  }

  return (
    <div className="relative min-h-[calc(100vh-60px)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-[#050A09] dark:via-emerald-950 dark:to-[#050A09]" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-teal-200/20 dark:bg-teal-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={BLOB_DELAY}
      />
      <div className="relative z-10">{content}</div>
    </div>
  );
};

export default AppDashboard;
