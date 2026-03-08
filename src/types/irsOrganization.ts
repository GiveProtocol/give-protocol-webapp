/** Represents a row returned by the search_irs_organizations RPC function. */
export interface IrsOrganization {
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
}

/** Parameters for the search_irs_organizations RPC call. */
export interface IrsSearchParams {
  search_query: string | null;
  filter_state: string | null;
  filter_ntee: string | null;
  result_limit: number;
  result_offset: number;
}

/** Paginated search result wrapper. */
export interface IrsSearchResult {
  organizations: IrsOrganization[];
  hasMore: boolean;
}
