import { useState, useCallback, useEffect, useRef } from 'react';
import { OrganizationSearchResult } from '@/types/selfReportedHours';
import { searchOrganizations, getOrganizationById } from '@/services/organizationSearchService';

interface UseOrganizationSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: OrganizationSearchResult[];
  loading: boolean;
  selectedOrg: OrganizationSearchResult | null;
  selectOrganization: (org: OrganizationSearchResult | null) => void;
  clearSelection: () => void;
  fetchOrganization: (id: string) => Promise<OrganizationSearchResult | null>;
}

/**
 * Hook for searching and selecting organizations
 * Includes debouncing for search queries
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns Object with search state and functions
 */
export function useOrganizationSearch(debounceMs = 300): UseOrganizationSearchReturn {
  const [query, setQueryInternal] = useState('');
  const [results, setResults] = useState<OrganizationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationSearchResult | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (searchQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const data = await searchOrganizations(searchQuery);
      setResults(data);
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name !== 'AbortError') {
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const setQuery = useCallback((newQuery: string) => {
    setQueryInternal(newQuery);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced search
    debounceTimerRef.current = setTimeout(() => {
      performSearch(newQuery);
    }, debounceMs);
  }, [debounceMs, performSearch]);

  const selectOrganization = useCallback((org: OrganizationSearchResult | null) => {
    setSelectedOrg(org);
    if (org) {
      setQueryInternal(org.name);
      setResults([]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedOrg(null);
    setQueryInternal('');
    setResults([]);
  }, []);

  const fetchOrganization = useCallback(async (id: string): Promise<OrganizationSearchResult | null> => {
    try {
      return await getOrganizationById(id);
    } catch {
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    selectedOrg,
    selectOrganization,
    clearSelection,
    fetchOrganization,
  };
}
