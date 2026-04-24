import { useCallback, useEffect, useRef, useState } from "react";
import { useScheduledDonation } from "@/hooks/web3/useScheduledDonation";
import { Logger } from "@/utils/logger";

interface UseScheduledDonationsReturn {
  count: number;
  loading: boolean;
}

/**
 * Loads the connected donor's active scheduled donation schedules and exposes a simple
 * `{ count, loading }` summary. Thin wrapper over `useScheduledDonation.getDonorSchedules`
 * so hub surfaces can consume the aggregate without re-implementing the fetch dance.
 */
export function useScheduledDonations(): UseScheduledDonationsReturn {
  const { getDonorSchedules } = useScheduledDonation();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const schedules = await getDonorSchedules();
      if (!mountedRef.current) return;
      setCount(schedules.filter((schedule) => schedule.active).length);
    } catch (err) {
      Logger.error("useScheduledDonations failed", { error: err });
      if (mountedRef.current) setCount(0);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [getDonorSchedules]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return { count, loading };
}
