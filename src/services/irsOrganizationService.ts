import { supabase } from '@/lib/supabase';
import type { IrsOrganization, IrsSearchParams, IrsSearchResult } from '@/types/irsOrganization';
import { Logger } from '@/utils/logger';

const EMPTY_RESULT: IrsSearchResult = { organizations: [], hasMore: false };

/**
 * Searches the IRS organizations database via the search_irs_organizations RPC.
 * Requires at least a 2-character query OR an active state filter.
 * @param params - Search parameters
 * @returns Paginated search results
 */
export async function searchIrsOrganizations(
  params: IrsSearchParams,
): Promise<IrsSearchResult> {
  const query = params.search_query?.trim() || '';
  const hasQuery = query.length >= 2;
  const hasStateFilter = Boolean(params.filter_state);

  if (!hasQuery && !hasStateFilter) {
    return EMPTY_RESULT;
  }

  try {
    const fetchLimit = params.result_limit + 1;

    const { data, error } = await supabase.rpc('search_irs_organizations', {
      search_query: hasQuery ? query : null,
      filter_state: params.filter_state || null,
      filter_ntee: params.filter_ntee || null,
      result_limit: fetchLimit,
      result_offset: params.result_offset,
    });

    if (error) {
      Logger.error('Error searching IRS organizations', { error, params });
      return EMPTY_RESULT;
    }

    const rows = (data || []) as IrsOrganization[];
    const hasMore = rows.length > params.result_limit;
    const organizations = hasMore ? rows.slice(0, params.result_limit) : rows;

    return { organizations, hasMore };
  } catch (error) {
    Logger.error('IRS organization search failed', {
      error: error instanceof Error ? error.message : String(error),
      params,
    });
    return EMPTY_RESULT;
  }
}
