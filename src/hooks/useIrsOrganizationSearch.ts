import { useState, useEffect, useCallback, useRef } from 'react';
import type { IrsOrganization } from '@/types/irsOrganization';
import { searchIrsOrganizations } from '@/services/irsOrganizationService';

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 350;

interface UseIrsOrganizationSearchParams {
  searchTerm: string;
  filterState: string;
  onPlatformOnly: boolean;
}

interface UseIrsOrganizationSearchReturn {
  organizations: IrsOrganization[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
}

/**
 * Hook for debounced search against the IRS organizations database.
 * Resets pagination when inputs change. Supports client-side "on platform only" filtering.
 * @param params - Search term, state filter, and on-platform toggle
 * @returns Search results with loading/pagination state
 */
export function useIrsOrganizationSearch({
  searchTerm,
  filterState,
  onPlatformOnly,
}: UseIrsOrganizationSearchParams): UseIrsOrganizationSearchReturn {
  const [allOrganizations, setAllOrganizations] = useState<IrsOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const mountedRef = useRef(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset offset when search inputs change
  useEffect(() => {
    setOffset(0);
    setAllOrganizations([]);
    setHasMore(false);
    setError(null);
  }, [searchTerm, filterState]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const query = searchTerm.trim();
    const hasQuery = query.length >= 2;
    const hasFilter = Boolean(filterState);

    if (!hasQuery && !hasFilter) {
      setAllOrganizations([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const result = await searchIrsOrganizations({
          search_query: hasQuery ? query : null,
          filter_state: filterState || null,
          filter_ntee: null,
          result_limit: PAGE_SIZE,
          result_offset: offset,
        });

        if (!mountedRef.current) return;

        if (offset === 0) {
          setAllOrganizations(result.organizations);
        } else {
          setAllOrganizations((prev) => [...prev, ...result.organizations]);
        }
        setHasMore(result.hasMore);
        setError(null);
      } catch {
        if (!mountedRef.current) return;
        setError('Failed to search organizations');
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, filterState, offset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setOffset((prev) => prev + PAGE_SIZE);
    }
  }, [loading, hasMore]);

  const organizations = onPlatformOnly
    ? allOrganizations.filter((org) => org.is_on_platform)
    : allOrganizations;

  return { organizations, loading, hasMore, error, loadMore };
}
