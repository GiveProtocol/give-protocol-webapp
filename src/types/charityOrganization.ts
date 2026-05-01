/** Represents a row returned by the search_charity_organizations RPC function. */
export interface CharityOrganization {
  id: string;
  ein: string;
  name: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  ntee_cd: string | null;
  deductibility: string | null;
  is_on_platform: boolean;
  platform_charity_id: string | null;
  rank: number;
  country: string | null;
  registry_source: string | null;
  data_source: string | null;
  data_vintage: string | null;
  last_synced_at: string | null;
}

/** Parameters for the search_charity_organizations RPC call. */
export interface CharitySearchParams {
  search_query: string | null;
  filter_state: string | null;
  filter_ntee: string | null;
  filter_country: string | null;
  result_limit: number;
  result_offset: number;
}

/** Paginated search result wrapper. */
export interface CharitySearchResult {
  organizations: CharityOrganization[];
  hasMore: boolean;
}
