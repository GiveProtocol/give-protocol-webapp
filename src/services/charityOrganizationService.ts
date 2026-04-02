import { supabase } from "@/lib/supabase";
import type {
  CharityOrganization,
  CharitySearchParams,
  CharitySearchResult,
} from "@/types/charityOrganization";
import { Logger } from "@/utils/logger";

const EMPTY_RESULT: CharitySearchResult = { organizations: [], hasMore: false };

/**
 * Searches the charity organizations database via the search_charity_organizations RPC.
 * Requires at least a 2-character query OR an active state/country filter.
 * @param params - Search parameters
 * @returns Paginated search results
 */
export async function searchCharityOrganizations(
  params: CharitySearchParams,
): Promise<CharitySearchResult> {
  const query = params.search_query?.trim() || "";
  const hasQuery = query.length >= 2;
  const hasStateFilter = Boolean(params.filter_state);
  const hasCountryFilter = Boolean(params.filter_country);

  if (!hasQuery && !hasStateFilter && !hasCountryFilter) {
    return EMPTY_RESULT;
  }

  try {
    const fetchLimit = params.result_limit + 1;

    const { data, error } = await supabase.rpc("search_charity_organizations", {
      search_query: hasQuery ? query : null,
      filter_state: params.filter_state || null,
      filter_ntee: params.filter_ntee || null,
      filter_country: params.filter_country || null,
      result_limit: fetchLimit,
      result_offset: params.result_offset,
    });

    if (error) {
      Logger.error("Error searching charity organizations", { error, params });
      return EMPTY_RESULT;
    }

    const rows = (data || []) as CharityOrganization[];
    const hasMore = rows.length > params.result_limit;
    const organizations = hasMore ? rows.slice(0, params.result_limit) : rows;

    return { organizations, hasMore };
  } catch (error) {
    Logger.error("Charity organization search failed", {
      error: error instanceof Error ? error.message : String(error),
      params,
    });
    return EMPTY_RESULT;
  }
}
