import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { DiscoveryShell } from "./DiscoveryShell";

/**
 * Skeleton placeholder that mirrors the DiscoveryShell layout while auth state is loading.
 */
export const DiscoveryShellSkeleton: React.FC = () => {
  return (
    <DiscoveryShell
      topBar={
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-24" count={3} />
        </div>
      }
      main={
        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 md:gap-8">
          <Skeleton className="h-64" count={6} />
        </div>
      }
      rail={
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      }
    />
  );
};
