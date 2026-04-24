import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Logger } from "@/utils/logger";

export interface FeaturedCharity {
  profileId: string;
  name: string;
  category: string;
  description: string;
  missionStatement: string;
  imageUrl: string;
  location: string | null;
}

interface ProfileRow {
  id: string;
  meta: {
    address?: {
      city?: string;
      stateProvince?: string;
      country?: string;
    } | null;
  } | null;
  charity_details:
    | {
        name: string | null;
        description: string | null;
        category: string | null;
        image_url: string | null;
        mission_statement: string | null;
      }
    | Array<{
        name: string | null;
        description: string | null;
        category: string | null;
        image_url: string | null;
        mission_statement: string | null;
      }>
    | null;
}

function pickDetails(
  row: ProfileRow,
): NonNullable<Exclude<ProfileRow["charity_details"], unknown[]>> | null {
  const cd = row.charity_details;
  if (!cd) return null;
  if (Array.isArray(cd)) return cd[0] ?? null;
  return cd;
}

function buildLocation(row: ProfileRow): string | null {
  const addr = row.meta?.address;
  if (!addr) return null;
  const parts = [addr.city, addr.stateProvince, addr.country].filter(
    (part): part is string =>
      typeof part === "string" && part.trim().length > 0,
  );
  return parts.length > 0 ? parts.join(", ") : null;
}

/**
 * Fetches every platform-signed-up charity whose profile is complete enough
 * to feature: name, description, category, image, and mission statement all
 * populated. Partial profiles are filtered out client-side so the carousel
 * never renders a card with missing chrome.
 */
export function useFeaturedCharities(): {
  charities: FeaturedCharity[];
  loading: boolean;
  error: string | null;
} {
  const [charities, setCharities] = useState<FeaturedCharity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const load = async () => {
      try {
        const { data, error: queryError } = await supabase
          .from("profiles")
          .select(
            `id, meta, charity_details ( name, description, category, image_url, mission_statement )`,
          )
          .eq("type", "charity");

        if (queryError) throw queryError;
        if (!mountedRef.current) return;

        const rows = (data ?? []) as ProfileRow[];
        const next: FeaturedCharity[] = [];
        for (const row of rows) {
          const details = pickDetails(row);
          if (!details) continue;
          const name = details.name?.trim();
          const description = details.description?.trim();
          const category = details.category?.trim();
          const imageUrl = details.image_url?.trim();
          const mission = details.mission_statement?.trim();
          if (!name || !description || !category || !imageUrl || !mission) {
            continue;
          }
          next.push({
            profileId: row.id,
            name,
            description,
            category,
            missionStatement: mission,
            imageUrl,
            location: buildLocation(row),
          });
        }

        setCharities(next);
        setError(null);
      } catch (err) {
        Logger.error("useFeaturedCharities failed", { error: err });
        if (!mountedRef.current) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load featured charities",
        );
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    load();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { charities, loading, error };
}
