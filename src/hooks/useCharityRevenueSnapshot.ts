import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { Logger } from "@/utils/logger";

interface RevenueSnapshot {
  fundsRaised: number;
  activeCampaigns: number;
  donorCount: number;
  dailyTotals: Array<{ date: string; total: number; count: number }>;
}

const EMPTY: RevenueSnapshot = {
  fundsRaised: 0,
  activeCampaigns: 0,
  donorCount: 0,
  dailyTotals: [],
};

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 30;

function buildDailyBuckets(
  rows: { amount: number | null; created_at: string; donor_id?: string | null }[],
): Array<{ date: string; total: number; count: number }> {
  const buckets = new Map<string, { total: number; count: number }>();
  const now = Date.now();
  for (let i = WINDOW_DAYS - 1; i >= 0; i -= 1) {
    const d = new Date(now - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { total: 0, count: 0 });
  }
  for (const row of rows) {
    const key = row.created_at.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.total += row.amount ?? 0;
    bucket.count += 1;
  }
  return Array.from(buckets.entries()).map(([date, value]) => ({
    date,
    total: value.total,
    count: value.count,
  }));
}

/**
 * Aggregates revenue snapshot data for the currently authenticated charity profile:
 * funds raised, active campaign count, distinct donor count, and 30-day daily totals.
 */
export function useCharityRevenueSnapshot() {
  const { profile } = useProfile();
  const [snapshot, setSnapshot] = useState<RevenueSnapshot>(EMPTY);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const charityId = profile?.id;
    if (!charityId) {
      setLoading(false);
      return () => {
        mountedRef.current = false;
      };
    }

    const load = async () => {
      setLoading(true);
      try {
        const since = new Date(Date.now() - WINDOW_DAYS * DAY_MS).toISOString();
        const [donationsResult, causesResult] = await Promise.all([
          supabase
            .from("donations")
            .select("amount, created_at, donor_id")
            .eq("charity_id", charityId),
          supabase
            .from("causes")
            .select("id, status")
            .eq("charity_id", charityId),
        ]);

        if (!mountedRef.current) return;

        const rows =
          (donationsResult.data as Array<{
            amount: number | null;
            created_at: string;
            donor_id: string | null;
          }> | null) ?? [];

        const fundsRaised = rows.reduce((sum, r) => sum + (r.amount ?? 0), 0);
        const donorCount = new Set(
          rows.map((r) => r.donor_id).filter((id): id is string => Boolean(id)),
        ).size;

        const causeRows =
          (causesResult.data as Array<{ status?: string | null }> | null) ?? [];
        const activeCampaigns = causeRows.filter(
          (c) => c.status === "active" || !c.status,
        ).length;

        const dailyTotals = buildDailyBuckets(
          rows.filter((r) => r.created_at >= since),
        );

        setSnapshot({ fundsRaised, activeCampaigns, donorCount, dailyTotals });
      } catch (err) {
        Logger.error("useCharityRevenueSnapshot failed", { error: err });
        if (mountedRef.current) setSnapshot(EMPTY);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    load();
    return () => {
      mountedRef.current = false;
    };
  }, [profile?.id]);

  return { snapshot, loading };
}
