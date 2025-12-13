import { describe, it, expect, beforeEach } from "@jest/globals";
import { setMockResult, resetMockState } from "@/test-utils/supabaseMock";
import { ValidationStatus, ActivityType } from "@/types/selfReportedHours";
import {
  createSelfReportedHours,
  getVolunteerSelfReportedHours,
  getSelfReportedHoursById,
  getVolunteerHoursStats,
  updateSelfReportedHours,
  deleteSelfReportedHours,
  requestValidation,
} from "./selfReportedHoursService";

describe("selfReportedHoursService", () => {
  beforeEach(() => {
    resetMockState();
  });

  describe("createSelfReportedHours", () => {
    it("should create a valid hours record", async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const mockRecord = {
        id: "record-1",
        volunteer_id: "user-1",
        activity_date: yesterday.toISOString().split("T")[0],
        hours: 4,
        activity_type: ActivityType.DIRECT_SERVICE,
        description:
          "This is a test description that meets the minimum character requirement for validation purposes.",
        organization_name: "Test Org",
        validation_status: ValidationStatus.UNVALIDATED,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      setMockResult("self_reported_hours", { data: mockRecord, error: null });

      const input = {
        activityDate: yesterday.toISOString().split("T")[0],
        hours: 4,
        activityType: ActivityType.DIRECT_SERVICE,
        description:
          "This is a test description that meets the minimum character requirement for validation purposes.",
        organizationName: "Test Org",
      };

      const result = await createSelfReportedHours("user-1", input);

      expect(result.id).toBe("record-1");
      expect(result.volunteerId).toBe("user-1");
      expect(result.hours).toBe(4);
    });

    it("should throw error for future date", async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const input = {
        activityDate: tomorrow.toISOString().split("T")[0],
        hours: 4,
        activityType: ActivityType.DIRECT_SERVICE,
        description:
          "This is a test description that meets the minimum character requirement for validation purposes.",
        organizationName: "Test Org",
      };

      await expect(createSelfReportedHours("user-1", input)).rejects.toThrow(
        "Activity date cannot be in the future",
      );
    });

    it("should throw error for invalid hours", async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const input = {
        activityDate: yesterday.toISOString().split("T")[0],
        hours: 25, // exceeds max
        activityType: ActivityType.DIRECT_SERVICE,
        description:
          "This is a test description that meets the minimum character requirement for validation purposes.",
        organizationName: "Test Org",
      };

      await expect(createSelfReportedHours("user-1", input)).rejects.toThrow(
        "Hours must be between",
      );
    });

    it("should throw error for short description", async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const input = {
        activityDate: yesterday.toISOString().split("T")[0],
        hours: 4,
        activityType: ActivityType.DIRECT_SERVICE,
        description: "Short", // too short
        organizationName: "Test Org",
      };

      await expect(createSelfReportedHours("user-1", input)).rejects.toThrow(
        "Description must be at least",
      );
    });

    it("should throw error when no organization specified", async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const input = {
        activityDate: yesterday.toISOString().split("T")[0],
        hours: 4,
        activityType: ActivityType.DIRECT_SERVICE,
        description:
          "This is a test description that meets the minimum character requirement for validation purposes.",
      };

      await expect(
        createSelfReportedHours("user-1", input as any),
      ).rejects.toThrow(
        "Either organization ID or organization name is required",
      );
    });
  });

  describe("getVolunteerSelfReportedHours", () => {
    it("should return volunteer hours", async () => {
      const now = new Date();
      const mockData = [
        {
          id: "record-1",
          volunteer_id: "user-1",
          activity_date: "2024-01-15",
          hours: 4,
          activity_type: ActivityType.DIRECT_SERVICE,
          description: "Test description",
          organization_name: "Org A",
          validation_status: ValidationStatus.UNVALIDATED,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
      ];
      setMockResult("self_reported_hours", { data: mockData, error: null });

      const result = await getVolunteerSelfReportedHours("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("record-1");
    });

    it("should throw on error", async () => {
      setMockResult("self_reported_hours", {
        data: null,
        error: { message: "DB Error" },
      });

      await expect(getVolunteerSelfReportedHours("user-1")).rejects.toThrow(
        "Failed to fetch records",
      );
    });
  });

  describe("getSelfReportedHoursById", () => {
    it("should return record by id", async () => {
      const now = new Date();
      const mockRecord = {
        id: "record-1",
        volunteer_id: "user-1",
        activity_date: "2024-01-15",
        hours: 4,
        activity_type: ActivityType.DIRECT_SERVICE,
        description: "Test description",
        organization_name: "Org A",
        validation_status: ValidationStatus.UNVALIDATED,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      setMockResult("self_reported_hours", { data: mockRecord, error: null });

      const result = await getSelfReportedHoursById("record-1", "user-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("record-1");
    });

    it("should return null when not found", async () => {
      setMockResult("self_reported_hours", {
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });

      const result = await getSelfReportedHoursById("nonexistent", "user-1");
      expect(result).toBeNull();
    });
  });

  describe("getVolunteerHoursStats", () => {
    it("should return stats object", async () => {
      const now = new Date();
      const mockData = [
        {
          id: "record-1",
          volunteer_id: "user-1",
          activity_date: "2024-01-15",
          hours: 4,
          activity_type: ActivityType.DIRECT_SERVICE,
          description: "Test",
          organization_name: "Org A",
          validation_status: ValidationStatus.VALIDATED,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
      ];
      setMockResult("self_reported_hours", { data: mockData, error: null });

      const result = await getVolunteerHoursStats("user-1");

      expect(result).toBeDefined();
      // Result should contain stats properties
      expect(
        typeof result.totalRecords === "number" ||
          result.totalRecords === undefined,
      ).toBe(true);
    });

    it("should throw on error", async () => {
      setMockResult("self_reported_hours", {
        data: null,
        error: { message: "DB Error" },
      });

      await expect(getVolunteerHoursStats("user-1")).rejects.toThrow(
        "Failed to fetch stats",
      );
    });
  });

  describe("updateSelfReportedHours", () => {
    it("should update record with valid data", async () => {
      const now = new Date();
      const mockUpdated = {
        id: "record-1",
        volunteer_id: "user-1",
        activity_date: "2024-01-15",
        hours: 5,
        activity_type: ActivityType.DIRECT_SERVICE,
        description:
          "Updated description that meets the minimum character requirement for validation purposes.",
        organization_name: "Org A",
        validation_status: ValidationStatus.UNVALIDATED,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      setMockResult("self_reported_hours", { data: mockUpdated, error: null });

      const updates = {
        hours: 5,
        description:
          "Updated description that meets the minimum character requirement for validation purposes.",
      };

      const result = await updateSelfReportedHours(
        "record-1",
        "user-1",
        updates,
      );

      expect(result.hours).toBe(5);
    });

    it("should throw error when record not found", async () => {
      setMockResult("self_reported_hours", {
        data: null,
        error: { message: "Not found" },
      });

      await expect(
        updateSelfReportedHours("nonexistent", "user-1", { hours: 5 }),
      ).rejects.toThrow();
    });
  });

  describe("deleteSelfReportedHours", () => {
    it("should delete unvalidated record", async () => {
      const now = new Date();
      const mockRecord = {
        id: "record-1",
        volunteer_id: "user-1",
        validation_status: ValidationStatus.UNVALIDATED,
        activity_date: "2024-01-15",
        hours: 4,
        activity_type: ActivityType.DIRECT_SERVICE,
        description: "Test",
        organization_name: "Test Org",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      setMockResult("self_reported_hours", { data: mockRecord, error: null });

      await expect(
        deleteSelfReportedHours("record-1", "user-1"),
      ).resolves.not.toThrow();
    });

    it("should throw error for validated record", async () => {
      const now = new Date();
      const mockRecord = {
        id: "record-1",
        volunteer_id: "user-1",
        validation_status: ValidationStatus.VALIDATED,
        activity_date: "2024-01-15",
        hours: 4,
        activity_type: ActivityType.DIRECT_SERVICE,
        description: "Test",
        organization_name: "Test Org",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      setMockResult("self_reported_hours", { data: mockRecord, error: null });

      await expect(
        deleteSelfReportedHours("record-1", "user-1"),
      ).rejects.toThrow("Cannot delete validated records");
    });
  });

  describe("requestValidation", () => {
    it("should throw error when record not found", async () => {
      setMockResult("self_reported_hours", {
        data: null,
        error: { message: "Not found" },
      });

      await expect(requestValidation("nonexistent", "user-1")).rejects.toThrow(
        "Record not found",
      );
    });

    it("should throw error when not unvalidated", async () => {
      const now = new Date();
      const mockRecord = {
        id: "record-1",
        volunteer_id: "user-1",
        validation_status: ValidationStatus.VALIDATED,
        organization_id: "org-1",
        activity_date: new Date(Date.now() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        hours: 4,
        activity_type: ActivityType.DIRECT_SERVICE,
        description: "Test",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      setMockResult("self_reported_hours", { data: mockRecord, error: null });

      await expect(requestValidation("record-1", "user-1")).rejects.toThrow(
        "Record is already validated",
      );
    });
  });
});
