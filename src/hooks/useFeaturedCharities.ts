import { useState, useEffect, useRef } from "react";
import type { CharityOrganization } from "@/types/charityOrganization";
import { getFeaturedCharities } from "@/services/charityOrganizationService";

/** NTEE major-code to human-readable category label. */
const NTEE_CATEGORY_MAP: Record<string, string> = {
  A: "Arts & Culture",
  B: "Education",
  C: "Environment",
  D: "Animal Welfare",
  E: "Health",
  F: "Mental Health",
  G: "Disease & Disorders",
  H: "Medical Research",
  I: "Crime & Legal",
  J: "Employment",
  K: "Food & Agriculture",
  L: "Housing",
  M: "Disaster Relief",
  N: "Recreation & Sports",
  O: "Youth Development",
  P: "Human Services",
  Q: "International",
  R: "Civil Rights",
  S: "Community Development",
  T: "Philanthropy",
  U: "Science & Technology",
  V: "Social Science",
  W: "Public Policy",
  X: "Religion",
  Y: "Mutual Benefit",
};

/** Presentation-ready shape consumed by FeaturedCharitiesCarousel. */
export interface FeaturedCharity {
  profileId: string;
  name: string;
  description: string;
  category: string;
  location: string;
  imageUrl: string;
}

/**
 * Maps an NTEE code prefix to a human-readable category name.
 * @param nteeCode - NTEE code string (e.g. "B20")
 * @returns Category label or "Nonprofit" as fallback
 */
function nteeToCategory(nteeCode: string | null | undefined): string {
  if (!nteeCode) return "Nonprofit";
  const major = nteeCode.charAt(0).toUpperCase();
  return NTEE_CATEGORY_MAP[major] ?? "Nonprofit";
}

/**
 * Transforms a raw CharityOrganization into the presentation shape
 * expected by the featured-charities carousel.
 * @param org - Raw charity organization record
 * @returns Presentation-ready featured charity object
 */
function toFeaturedCharity(org: CharityOrganization): FeaturedCharity {
  const parts = [org.city, org.state].filter(Boolean);
  return {
    profileId: org.ein,
    name: org.name,
    description: `${org.name} is a verified ${nteeToCategory(org.ntee_cd).toLowerCase()} organization on Give Protocol.`,
    category: nteeToCategory(org.ntee_cd),
    location: parts.join(", "),
    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&background=059669&color=fff&size=640&bold=true&format=svg`,
  };
}

interface UseFeaturedCharitiesReturn {
  charities: FeaturedCharity[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that fetches platform-featured charities on mount and transforms them
 * into the presentation shape consumed by FeaturedCharitiesCarousel.
 * @returns Featured charities with loading and error state
 */
export function useFeaturedCharities(): UseFeaturedCharitiesReturn {
  const [charities, setCharities] = useState<FeaturedCharity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    getFeaturedCharities()
      .then((data) => {
        if (!mountedRef.current) return;
        setCharities(data.map(toFeaturedCharity));
        setLoading(false);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setError("Failed to load featured charities");
        setLoading(false);
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { charities, loading, error };
}
