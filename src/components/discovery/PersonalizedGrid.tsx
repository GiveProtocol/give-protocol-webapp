import React, { useMemo } from "react";
import { ProjectCard } from "./ProjectCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCharityOrganizationSearch } from "@/hooks/useCharityOrganizationSearch";

interface Donation {
  charity: string;
}

interface PersonalizedGridProps {
  donations: Donation[] | undefined;
}

/**
 * Discovery grid for authenticated donors. Derives a search hint from the donor's past
 * donation recipients when available; otherwise falls back to a default US-on-platform set.
 */
export const PersonalizedGrid: React.FC<PersonalizedGridProps> = ({ donations }) => {
  const searchTerm = useMemo(() => {
    if (!donations || donations.length === 0) return "";
    const firstWord = donations[0].charity.split(" ")[0] ?? "";
    return firstWord.length >= 2 ? firstWord : "";
  }, [donations]);

  const { organizations, loading } = useCharityOrganizationSearch({
    searchTerm,
    filterState: "",
    filterCountry: searchTerm ? "" : "US",
    onPlatformOnly: false,
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Personalized for You
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {searchTerm
            ? "Based on your recent giving"
            : "Trending on the platform"}
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 md:gap-8">
        {loading && organizations.length === 0 ? (
          <Skeleton className="h-64" count={6} />
        ) : (
          organizations.slice(0, 9).map((org) => (
            <ProjectCard key={org.ein} organization={org} />
          ))
        )}
      </div>
      {!loading && organizations.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          We&apos;re warming up your recommendations. Browse the full catalog to get started.
        </div>
      )}
    </section>
  );
};
