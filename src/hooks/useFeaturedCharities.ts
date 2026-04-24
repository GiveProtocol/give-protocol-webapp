import { useState, useEffect, useRef } from "react";
import type { CharityOrganization } from "@/types/charityOrganization";
import { getFeaturedCharities } from "@/services/charityOrganizationService";

interface UseFeaturedCharitiesReturn {
  charities: CharityOrganization[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that fetches platform-featured charities on mount.
 * @returns Featured charities with loading and error state
 */
export function useFeaturedCharities(): UseFeaturedCharitiesReturn {
  const [charities, setCharities] = useState<CharityOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    getFeaturedCharities()
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
