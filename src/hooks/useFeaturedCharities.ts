import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Logger } from "@/utils/logger";

/** Display shape for a featured charity in the carousel. */
export interface FeaturedCharity {
  profileId: string; // EIN — matches /charity/:ein route
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  location?: string;
}

interface UseFeaturedCharitiesReturn {
  charities: FeaturedCharity[];
  loading: boolean;
  error: string | null;
}

// Maps NTEE major group code to human-readable category label.
const NTEE_CATEGORY_MAP: Record<string, string> = {
  A: "Arts & Culture",
  B: "Education",
  C: "Environment",
  D: "Animal Welfare",
  E: "Health",
  F: "Mental Health",
  G: "Medical Research",
  H: "Biomedical Research",
  I: "Crime & Legal",
  J: "Employment",
  K: "Food & Nutrition",
  L: "Housing",
  M: "Public Safety",
  N: "Recreation",
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

function nteeToCategory(nteeCode: string | null | undefined): string {
  if (!nteeCode) return "Nonprofit";
  const major = nteeCode.charAt(0).toUpperCase();
  return NTEE_CATEGORY_MAP[major] ?? "Nonprofit";
}

interface CharityProfileRow {
  ein: string;
  name: string;
  mission: string | null;
  location: string | null;
  logo_url: string | null;
  ntee_code: string | null;
}

const FEATURED_LIMIT = 12;

async function loadFeaturedCharities(): Promise<FeaturedCharity[]> {
  const { data, error } = await supabase
    .from("charity_profiles")
    .select("ein, name, mission, location, logo_url, ntee_code")
    .eq("status", "verified")
    .not("logo_url", "is", null)
    .limit(FEATURED_LIMIT);

  if (error) {
    Logger.error("Error fetching featured charities", { error });
    throw error;
  }

  return ((data ?? []) as CharityProfileRow[]).map((row) => ({
    profileId: row.ein,
    name: row.name,
    description: row.mission ?? "",
    category: nteeToCategory(row.ntee_code),
    imageUrl: row.logo_url ?? "",
    location: row.location !== null ? row.location : undefined,
  }));
}

/**
 * Hook that fetches verified platform charities for the featured carousel.
 * @returns Featured charities with loading and error state
 */
export function useFeaturedCharities(): UseFeaturedCharitiesReturn {
  const [charities, setCharities] = useState<FeaturedCharity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    loadFeaturedCharities()
      .then((data) => {
        if (!mountedRef.current) return;
        setCharities(data);
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
