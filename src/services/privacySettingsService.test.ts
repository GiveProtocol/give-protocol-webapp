import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  supabase,
  setMockResult,
  resetMockState,
} from "@/test-utils/supabaseMock";
import { getPrivateUserIds } from "./privacySettingsService";

jest.mock("@/utils/logger", () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("privacySettingsService", () => {
  beforeEach(() => {
    resetMockState();
  });

  describe("getPrivateUserIds", () => {
    it("should return user IDs where publicProfile is false", async () => {
      setMockResult("user_preferences", {
        data: [
          { user_id: "user-1", privacy_settings: { publicProfile: false, showDonations: true } },
          { user_id: "user-2", privacy_settings: { publicProfile: true, showDonations: true } },
        ],
        error: null,
      });

      const privateIds = await getPrivateUserIds("showDonations");

      expect(privateIds.has("user-1")).toBe(true);
      expect(privateIds.has("user-2")).toBe(false);
    });

    it("should return user IDs where specific field is false", async () => {
      setMockResult("user_preferences", {
        data: [
          { user_id: "user-1", privacy_settings: { publicProfile: true, showDonations: false } },
          { user_id: "user-2", privacy_settings: { publicProfile: true, showDonations: true } },
          { user_id: "user-3", privacy_settings: { publicProfile: true, showVolunteerHours: false } },
        ],
        error: null,
      });

      const privateDonorIds = await getPrivateUserIds("showDonations");

      expect(privateDonorIds.has("user-1")).toBe(true);
      expect(privateDonorIds.has("user-2")).toBe(false);
      expect(privateDonorIds.has("user-3")).toBe(false);
    });

    it("should return user IDs for showVolunteerHours field", async () => {
      setMockResult("user_preferences", {
        data: [
          { user_id: "user-1", privacy_settings: { publicProfile: true, showVolunteerHours: false } },
          { user_id: "user-2", privacy_settings: { publicProfile: true, showVolunteerHours: true } },
        ],
        error: null,
      });

      const privateIds = await getPrivateUserIds("showVolunteerHours");

      expect(privateIds.has("user-1")).toBe(true);
      expect(privateIds.has("user-2")).toBe(false);
    });

    it("should treat users with both publicProfile=false and field=false as private", async () => {
      setMockResult("user_preferences", {
        data: [
          { user_id: "user-1", privacy_settings: { publicProfile: false, showDonations: false } },
        ],
        error: null,
      });

      const privateIds = await getPrivateUserIds("showDonations");

      expect(privateIds.has("user-1")).toBe(true);
    });

    it("should not exclude users with null privacy_settings", async () => {
      setMockResult("user_preferences", {
        data: [
          { user_id: "user-1", privacy_settings: null },
        ],
        error: null,
      });

      const privateIds = await getPrivateUserIds("showDonations");

      expect(privateIds.size).toBe(0);
    });

    it("should return empty set when no data", async () => {
      setMockResult("user_preferences", {
        data: [],
        error: null,
      });

      const privateIds = await getPrivateUserIds("showDonations");

      expect(privateIds.size).toBe(0);
    });

    it("should return empty set on database error", async () => {
      setMockResult("user_preferences", {
        data: null,
        error: { message: "Database error" },
      });

      const privateIds = await getPrivateUserIds("showDonations");

      expect(privateIds.size).toBe(0);
    });

    it("should return empty set on null data", async () => {
      setMockResult("user_preferences", {
        data: null,
        error: null,
      });

      const privateIds = await getPrivateUserIds("showDonations");

      expect(privateIds.size).toBe(0);
    });

    it("should return empty set when supabase throws", async () => {
      const originalFrom = supabase.from;
      supabase.from = jest.fn(() => {
        throw new Error("Connection lost");
      }) as typeof supabase.from;

      const privateIds = await getPrivateUserIds("showDonations");

      expect(privateIds.size).toBe(0);

      supabase.from = originalFrom;
    });

    it("should handle mixed privacy settings correctly", async () => {
      setMockResult("user_preferences", {
        data: [
          { user_id: "public-user", privacy_settings: { publicProfile: true, showDonations: true, showVolunteerHours: true } },
          { user_id: "private-profile", privacy_settings: { publicProfile: false, showDonations: true, showVolunteerHours: true } },
          { user_id: "hidden-donations", privacy_settings: { publicProfile: true, showDonations: false, showVolunteerHours: true } },
          { user_id: "hidden-hours", privacy_settings: { publicProfile: true, showDonations: true, showVolunteerHours: false } },
          { user_id: "no-settings", privacy_settings: null },
        ],
        error: null,
      });

      const donorPrivateIds = await getPrivateUserIds("showDonations");

      expect(donorPrivateIds.has("public-user")).toBe(false);
      expect(donorPrivateIds.has("private-profile")).toBe(true);
      expect(donorPrivateIds.has("hidden-donations")).toBe(true);
      expect(donorPrivateIds.has("hidden-hours")).toBe(false);
      expect(donorPrivateIds.has("no-settings")).toBe(false);
    });
  });
});
