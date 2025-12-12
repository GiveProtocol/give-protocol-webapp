import { supabase } from '@/lib/supabase';
import { OrganizationSearchResult } from '@/types/selfReportedHours';
import { Logger } from '@/utils/logger';

/**
 * Searches for verified organizations by name
 * @param query - Search query string
 * @param limit - Maximum number of results to return
 * @returns Array of organization search results
 */
export async function searchOrganizations(
  query: string,
  limit = 10
): Promise<OrganizationSearchResult[]> {
  // Require at least 2 characters for search
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.trim();

  try {
    // Search profiles where type is 'charity'
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, type, meta')
      .eq('type', 'charity')
      .ilike('name', `%${searchTerm}%`)
      .limit(limit);

    if (error) {
      Logger.error('Error searching organizations', { error, query: searchTerm });
      throw new Error(`Search failed: ${error.message}`);
    }

    return (data || []).map((org) => {
      const meta = org.meta as { logoUrl?: string; location?: string } | null;

      return {
        id: org.id,
        name: org.name || 'Unknown Organization',
        isVerified: true, // All orgs in our database are considered verified
        location: meta?.location,
        logoUrl: meta?.logoUrl,
      };
    });
  } catch (error) {
    Logger.error('Organization search failed', {
      error: error instanceof Error ? error.message : String(error),
      query: searchTerm,
    });
    return [];
  }
}

/**
 * Gets a single organization by ID
 * @param organizationId - The organization's profile ID
 * @returns Organization search result or null if not found
 */
export async function getOrganizationById(
  organizationId: string
): Promise<OrganizationSearchResult | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, type, meta')
      .eq('id', organizationId)
      .eq('type', 'charity')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      Logger.error('Error fetching organization', { error, organizationId });
      throw new Error(`Failed to fetch organization: ${error.message}`);
    }

    const meta = data.meta as { logoUrl?: string; location?: string } | null;

    return {
      id: data.id,
      name: data.name || 'Unknown Organization',
      isVerified: true,
      location: meta?.location,
      logoUrl: meta?.logoUrl,
    };
  } catch (error) {
    Logger.error('Get organization failed', {
      error: error instanceof Error ? error.message : String(error),
      organizationId,
    });
    return null;
  }
}

/**
 * Gets all verified organizations (for full list display)
 * @param limit - Maximum number to return
 * @param offset - Offset for pagination
 * @returns Array of organization search results
 */
export async function getAllOrganizations(
  limit = 50,
  offset = 0
): Promise<{ organizations: OrganizationSearchResult[]; total: number }> {
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'charity');

    if (countError) {
      Logger.error('Error counting organizations', { error: countError });
    }

    // Get organizations
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, type, meta')
      .eq('type', 'charity')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      Logger.error('Error fetching all organizations', { error });
      throw new Error(`Failed to fetch organizations: ${error.message}`);
    }

    const organizations = (data || []).map((org) => {
      const meta = org.meta as { logoUrl?: string; location?: string } | null;

      return {
        id: org.id,
        name: org.name || 'Unknown Organization',
        isVerified: true,
        location: meta?.location,
        logoUrl: meta?.logoUrl,
      };
    });

    return {
      organizations,
      total: count || organizations.length,
    };
  } catch (error) {
    Logger.error('Get all organizations failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { organizations: [], total: 0 };
  }
}

/**
 * Checks if an organization exists and is verified
 * @param organizationId - The organization's profile ID
 * @returns True if organization exists and is a charity
 */
export async function isVerifiedOrganization(
  organizationId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', organizationId)
      .eq('type', 'charity')
      .single();

    if (error) {
      return false;
    }

    return Boolean(data);
  } catch {
    return false;
  }
}
