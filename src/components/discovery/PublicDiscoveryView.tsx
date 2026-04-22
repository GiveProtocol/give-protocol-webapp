import React, { useCallback, useState } from "react";
import { Search } from "lucide-react";
import { DiscoveryShell } from "./DiscoveryShell";
import { CategoryChips } from "./CategoryChips";
import { ProjectCard } from "./ProjectCard";
import { WhyGiveProtocolRail } from "./WhyGiveProtocolRail";
import { useCharityOrganizationSearch } from "@/hooks/useCharityOrganizationSearch";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Unauthenticated /app view. Centers a minimalist SearchBar + category chips above a 3-col
 * grid of ProjectCards, with a "Why Give Protocol" rail on large screens.
 */
export const PublicDiscoveryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  const handleCategoryChange = useCallback((filter: { state?: string }) => {
    setFilterState(filter.state ?? "");
  }, []);

  const { organizations, loading } = useCharityOrganizationSearch({
    searchTerm,
    filterState,
    filterCountry: filterState || searchTerm ? "" : "US",
    onPlatformOnly: false,
  });

  const hero = (
    <div className="text-center">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
        Discover causes worth championing
      </h1>
      <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
        Search verified nonprofits. Donate with crypto or card. Volunteer your
        skills.
      </p>
      <div className="mt-6 max-w-2xl mx-auto">
        <label htmlFor="discovery-search" className="sr-only">
          Search charities
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          />
          <input
            id="discovery-search"
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by cause, location, or organization"
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>
      <div className="mt-6">
        <CategoryChips
          activeState={filterState}
          onChange={handleCategoryChange}
        />
      </div>
    </div>
  );

  const grid = (
    <section>
      <h2 className="sr-only">Featured organizations</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 md:gap-8">
        {loading && organizations.length === 0 ? (
          <Skeleton className="h-64" count={6} />
        ) : (
          organizations.map((org) => (
            <ProjectCard key={org.ein} organization={org} />
          ))
        )}
      </div>
      {!loading && organizations.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No organizations match that search yet. Try a different keyword or
          category.
        </div>
      )}
    </section>
  );

  return (
    <DiscoveryShell topBar={hero} main={grid} rail={<WhyGiveProtocolRail />} />
  );
};
