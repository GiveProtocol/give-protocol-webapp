import React from "react";
import { Link } from "react-router-dom";
import { useFeaturedCharities } from "@/hooks/useFeaturedCharities";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/**
 * Horizontal scroll carousel of platform-featured charities.
 * Loads automatically on mount via useFeaturedCharities.
 * @returns The rendered carousel, loading spinner, or empty/error state
 */
export const FeaturedCharitiesCarousel: React.FC = () => {
  const { charities, loading, error } = useFeaturedCharities();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error !== null) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 py-4">{error}</p>
    );
  }

  if (charities.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
        No featured charities available yet.
      </p>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
      {charities.map((charity) => (
        <div
          key={charity.profileId}
          className="flex-shrink-0 w-72 snap-start"
          data-testid="charity-card"
        >
          <Link
            to={`/charity/${charity.profileId}`}
            className="font-medium text-gray-900 dark:text-gray-100 hover:text-emerald-700 dark:hover:text-emerald-400"
          >
            {charity.name}
          </Link>
        </div>
      ))}
    </div>
  );
};
