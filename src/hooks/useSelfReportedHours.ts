import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  SelfReportedHoursDisplay,
  SelfReportedHoursInput,
  SelfReportedHoursFilters,
  VolunteerHoursStats,
} from "@/types/selfReportedHours";
import {
  createSelfReportedHours,
  getVolunteerSelfReportedHours,
  getSelfReportedHoursById,
  getVolunteerHoursStats,
  updateSelfReportedHours,
  deleteSelfReportedHours,
  requestValidation,
} from "@/services/selfReportedHoursService";
import {
  cancelValidationRequest,
  resubmitValidationRequest,
} from "@/services/validationRequestService";
import { Logger } from "@/utils/logger";

interface UseSelfReportedHoursReturn {
  hours: SelfReportedHoursDisplay[];
  stats: VolunteerHoursStats | null;
  loading: boolean;
  error: string | null;
  filters: SelfReportedHoursFilters;
  setFilters: React.Dispatch<React.SetStateAction<SelfReportedHoursFilters>>;
  createHours: (_input: SelfReportedHoursInput) => Promise<boolean>;
  updateHours: (
    _id: string,
    _input: Partial<SelfReportedHoursInput>,
  ) => Promise<boolean>;
  deleteHours: (_id: string) => Promise<boolean>;
  requestHoursValidation: (
    _id: string,
    _organizationId: string,
  ) => Promise<boolean>;
  cancelRequest: (_requestId: string) => Promise<boolean>;
  resubmitRequest: (_requestId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
  getHoursById: (_id: string) => Promise<SelfReportedHoursDisplay | null>;
}

/**
 * Hook for managing self-reported volunteer hours
 * @returns Object with hours data, stats, and CRUD operations
 */
export function useSelfReportedHours(): UseSelfReportedHoursReturn {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [hours, setHours] = useState<SelfReportedHoursDisplay[]>([]);
  const [stats, setStats] = useState<VolunteerHoursStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SelfReportedHoursFilters>({});

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setHours([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [hoursData, statsData] = await Promise.all([
        getVolunteerSelfReportedHours(user.id, filters),
        getVolunteerHoursStats(user.id),
      ]);

      setHours(hoursData);
      setStats(statsData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch hours";
      setError(message);
      Logger.error("Error fetching self-reported hours", {
        error: err,
        userId: user.id,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createHours = useCallback(
    async (input: SelfReportedHoursInput): Promise<boolean> => {
      if (!user?.id) {
        showToast("error", "Error", "You must be logged in to log hours");
        return false;
      }

      try {
        await createSelfReportedHours(user.id, input);
        showToast("success", "Success", "Volunteer hours logged successfully");
        await fetchData();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create record";
        showToast("error", "Error", message);
        Logger.error("Error creating self-reported hours", { error: err });
        return false;
      }
    },
    [user?.id, showToast, fetchData],
  );

  const updateHours = useCallback(
    async (
      id: string,
      input: Partial<SelfReportedHoursInput>,
    ): Promise<boolean> => {
      if (!user?.id) {
        showToast("error", "Error", "You must be logged in");
        return false;
      }

      try {
        await updateSelfReportedHours(id, user.id, input);
        showToast("success", "Success", "Record updated successfully");
        await fetchData();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update record";
        showToast("error", "Error", message);
        return false;
      }
    },
    [user?.id, showToast, fetchData],
  );

  const deleteHours = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user?.id) {
        showToast("error", "Error", "You must be logged in");
        return false;
      }

      try {
        await deleteSelfReportedHours(id, user.id);
        showToast("success", "Success", "Record deleted successfully");
        await fetchData();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete record";
        showToast("error", "Error", message);
        return false;
      }
    },
    [user?.id, showToast, fetchData],
  );

  const requestHoursValidation = useCallback(
    async (id: string, organizationId: string): Promise<boolean> => {
      if (!user?.id) {
        showToast("error", "Error", "You must be logged in");
        return false;
      }

      try {
        await requestValidation(id, user.id, organizationId);
        showToast("success", "Success", "Validation request sent");
        await fetchData();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to request validation";
        showToast("error", "Error", message);
        return false;
      }
    },
    [user?.id, showToast, fetchData],
  );

  const cancelRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      if (!user?.id) {
        showToast("error", "Error", "You must be logged in");
        return false;
      }

      try {
        await cancelValidationRequest(requestId, user.id);
        showToast("success", "Success", "Validation request cancelled");
        await fetchData();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to cancel request";
        showToast("error", "Error", message);
        return false;
      }
    },
    [user?.id, showToast, fetchData],
  );

  const resubmitRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      if (!user?.id) {
        showToast("error", "Error", "You must be logged in");
        return false;
      }

      try {
        await resubmitValidationRequest(requestId, user.id);
        showToast("success", "Success", "Appeal submitted successfully");
        await fetchData();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to submit appeal";
        showToast("error", "Error", message);
        return false;
      }
    },
    [user?.id, showToast, fetchData],
  );

  const getHoursById = useCallback(
    async (id: string): Promise<SelfReportedHoursDisplay | null> => {
      if (!user?.id) {
        return null;
      }

      try {
        return await getSelfReportedHoursById(id, user.id);
      } catch (err) {
        Logger.error("Error fetching hours by ID", { error: err, id });
        return null;
      }
    },
    [user?.id],
  );

  return {
    hours,
    stats,
    loading,
    error,
    filters,
    setFilters,
    createHours,
    updateHours,
    deleteHours,
    requestHoursValidation,
    cancelRequest,
    resubmitRequest,
    refetch: fetchData,
    getHoursById,
  };
}
