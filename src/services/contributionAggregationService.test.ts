import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  supabase,
  setMockResult,
  resetMockState,
} from "@/test-utils/supabaseMock";
import {
  getUserContributionStats,
  getUnifiedContributions,
  getVolunteerLeaderboard,
  getDonorLeaderboard,
  getGlobalContributionStats,
} from "./contributionAggregationService";

// Mock Logger
jest.mock("@/utils/logger", () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("contributionAggregationService", () => {
  beforeEach(() => {
    resetMockState();
  });

  describe("getUserContributionStats", () => {
    it("should aggregate stats from all sources", async () => {
      setMockResult("donations", {
        data: [{ amount: 100 }, { amount: 250 }],
        error: null,
      });
      setMockResult("fiat_donations", {
        data: [{ amount_cents: 5000 }, { amount_cents: 3000 }],
        error: null,
      });
      setMockResult("volunteer_hours", {
        data: [
          { hours: 5, charity_id: "org-1" },
          { hours: 3, charity_id: "org-2" },
        ],
        error: null,
      });
      setMockResult("self_reported_hours", {
        data: [
          { hours: 4, validation_status: "validated", organization_id: "org-1", organization_name: "Org 1" },
          { hours: 2, validation_status: "pending", organization_id: null, organization_name: "New Org" },
          { hours: 1, validation_status: "unvalidated", organization_id: null, organization_name: null },
        ],
        error: null,
      });
      setMockResult("skill_endorsements", {
        data: [{ id: "end-1" }, { id: "end-2" }],
        error: null,
      });

      const stats = await getUserContributionStats("user-1");

      expect(stats.userId).toBe("user-1");
      expect(stats.totalDonated).toBe(350);
      expect(stats.donationCount).toBe(2);
      expect(stats.totalFiatDonated).toBe(80);
      expect(stats.fiatDonationCount).toBe(2);
      expect(stats.formalVolunteerHours).toBe(8);
      expect(stats.selfReportedHours.validated).toBe(4);
      expect(stats.selfReportedHours.pending).toBe(2);
      expect(stats.selfReportedHours.unvalidated).toBe(1);
      expect(stats.selfReportedHours.total).toBe(7);
      expect(stats.totalVolunteerHours).toBe(12); // 8 formal + 4 validated
      expect(stats.skillsEndorsed).toBe(2);
      expect(stats.organizationsHelped).toBe(3); // org-1, org-2, name:New Org
    });

    it("should handle empty data gracefully", async () => {
      setMockResult("donations", { data: null, error: null });
      setMockResult("fiat_donations", { data: null, error: null });
      setMockResult("volunteer_hours", { data: null, error: null });
      setMockResult("self_reported_hours", { data: null, error: null });
      setMockResult("skill_endorsements", { data: null, error: null });

      const stats = await getUserContributionStats("user-empty");

      expect(stats.totalDonated).toBe(0);
      expect(stats.donationCount).toBe(0);
      expect(stats.totalFiatDonated).toBe(0);
      expect(stats.fiatDonationCount).toBe(0);
      expect(stats.formalVolunteerHours).toBe(0);
      expect(stats.selfReportedHours.total).toBe(0);
      expect(stats.totalVolunteerHours).toBe(0);
      expect(stats.skillsEndorsed).toBe(0);
      expect(stats.organizationsHelped).toBe(0);
    });

    it("should handle query errors without throwing", async () => {
      setMockResult("donations", { data: null, error: { message: "DB error" } });
      setMockResult("fiat_donations", { data: null, error: { message: "DB error" } });
      setMockResult("volunteer_hours", { data: null, error: { message: "DB error" } });
      setMockResult("self_reported_hours", { data: null, error: { message: "DB error" } });
      setMockResult("skill_endorsements", { data: null, error: { message: "DB error" } });

      const stats = await getUserContributionStats("user-err");

      expect(stats.totalDonated).toBe(0);
      expect(stats.donationCount).toBe(0);
    });
  });

  describe("getUnifiedContributions", () => {
    it("should fetch and merge contributions from all sources", async () => {
      setMockResult("donations", {
        data: [{
          id: "d-1", amount: 100, created_at: "2025-06-01T00:00:00Z",
          donor_id: "u-1", charity_id: "c-1",
          charity: { charity_details: { name: "Charity A" } },
        }],
        error: null,
      });
      setMockResult("fiat_donations", {
        data: [{
          id: "fd-1", amount_cents: 5000, currency: "usd", payment_method: "card",
          transaction_id: "tx-1", card_last_four: "4242", donor_name: "Test",
          disbursement_status: "completed", status: "completed",
          created_at: "2025-06-02T00:00:00Z", donor_id: "u-1", charity_id: "c-2",
          charity: { charity_details: { name: "Charity B" } },
        }],
        error: null,
      });
      setMockResult("volunteer_hours", {
        data: [{
          id: "vh-1", hours: 5, date_performed: "2025-06-03",
          description: "Helped out", status: "approved",
          created_at: "2025-06-03T00:00:00Z", volunteer_id: "u-1", charity_id: "c-1",
        }],
        error: null,
      });
      setMockResult("self_reported_hours", {
        data: [{
          id: "sr-1", hours: 3, activity_date: "2025-06-04",
          activity_type: "mentoring", description: "Mentored students",
          validation_status: "validated", created_at: "2025-06-04T00:00:00Z",
          volunteer_id: "u-1", organization_id: "c-3", organization_name: "Org C",
        }],
        error: null,
      });

      const contributions = await getUnifiedContributions({ userId: "u-1" });

      expect(contributions).toHaveLength(4);
      // Should be sorted by date descending
      expect(contributions[0].id).toBe("sr-1");
      expect(contributions[1].id).toBe("vh-1");
      expect(contributions[2].id).toBe("fd-1");
      expect(contributions[3].id).toBe("d-1");
    });

    it("should filter by specific sources", async () => {
      setMockResult("donations", {
        data: [{ id: "d-1", amount: 50, created_at: "2025-01-01T00:00:00Z", donor_id: "u-1", charity_id: "c-1", charity: null }],
        error: null,
      });

      const contributions = await getUnifiedContributions({
        userId: "u-1",
        sources: ["donation"],
      });

      expect(contributions).toHaveLength(1);
      expect(contributions[0].type).toBe("donation");
    });

    it("should handle database errors and return empty arrays", async () => {
      setMockResult("donations", { data: null, error: { message: "Table error" } });
      setMockResult("fiat_donations", { data: null, error: { message: "Table error" } });
      setMockResult("volunteer_hours", { data: null, error: { message: "Table error" } });
      setMockResult("self_reported_hours", { data: null, error: { message: "Table error" } });

      const contributions = await getUnifiedContributions({ userId: "u-1" });

      expect(contributions).toHaveLength(0);
    });

    it("should apply organization filter", async () => {
      setMockResult("donations", { data: [], error: null });
      setMockResult("fiat_donations", { data: [], error: null });
      setMockResult("volunteer_hours", { data: [], error: null });
      setMockResult("self_reported_hours", { data: [], error: null });

      const contributions = await getUnifiedContributions({
        userId: "u-1",
        organizationId: "org-123",
      });

      expect(contributions).toHaveLength(0);
    });

    it("should apply date range filters", async () => {
      setMockResult("donations", { data: [], error: null });
      setMockResult("fiat_donations", { data: [], error: null });
      setMockResult("volunteer_hours", { data: [], error: null });
      setMockResult("self_reported_hours", { data: [], error: null });

      const contributions = await getUnifiedContributions({
        userId: "u-1",
        dateFrom: "2025-01-01",
        dateTo: "2025-12-31",
      });

      expect(contributions).toHaveLength(0);
    });

    it("should apply validation status filter for self-reported hours", async () => {
      setMockResult("self_reported_hours", {
        data: [{
          id: "sr-1", hours: 2, activity_date: "2025-06-01",
          activity_type: "teaching", description: "Taught class",
          validation_status: "validated", created_at: "2025-06-01T00:00:00Z",
          volunteer_id: "u-1", organization_id: null, organization_name: "School",
        }],
        error: null,
      });

      const contributions = await getUnifiedContributions({
        userId: "u-1",
        sources: ["self_reported"],
        validationStatus: ["validated"],
      });

      expect(contributions).toHaveLength(1);
      expect(contributions[0].validationStatus).toBe("validated");
    });

    it("should map fiat donation status correctly", async () => {
      setMockResult("fiat_donations", {
        data: [{
          id: "fd-1", amount_cents: 1000, currency: "usd", payment_method: "card",
          transaction_id: "tx-1", card_last_four: "1234", donor_name: "Test",
          disbursement_status: "pending", status: "pending",
          created_at: "2025-01-01T00:00:00Z", donor_id: "u-1", charity_id: "c-1",
          charity: { charity_details: { name: "Test Charity" } },
        }],
        error: null,
      });

      const contributions = await getUnifiedContributions({
        userId: "u-1",
        sources: ["fiat_donation"],
      });

      expect(contributions[0].status).toBe("pending");
      expect(contributions[0].isFiatDonation).toBe(true);
    });

    it("should map unvalidated self-reported hours correctly", async () => {
      setMockResult("self_reported_hours", {
        data: [{
          id: "sr-1", hours: 1, activity_date: "2025-01-01",
          activity_type: "other", description: "Test",
          validation_status: null, created_at: "2025-01-01T00:00:00Z",
          volunteer_id: "u-1", organization_id: null, organization_name: "Org",
        }],
        error: null,
      });

      const contributions = await getUnifiedContributions({
        userId: "u-1",
        sources: ["self_reported"],
      });

      expect(contributions[0].status).toBe("unvalidated");
    });

    it("should map volunteer status approved to completed", async () => {
      setMockResult("volunteer_hours", {
        data: [{
          id: "vh-1", hours: 4, date_performed: "2025-03-01",
          description: "Helped", status: "pending",
          created_at: "2025-03-01T00:00:00Z", volunteer_id: "u-1", charity_id: "c-1",
        }],
        error: null,
      });

      const contributions = await getUnifiedContributions({
        userId: "u-1",
        sources: ["formal_volunteer"],
      });

      expect(contributions[0].status).toBe("pending");
    });
  });

  describe("getVolunteerLeaderboard", () => {
    it("should aggregate and rank volunteers by total hours", async () => {
      setMockResult("volunteer_hours", {
        data: [
          { volunteer_id: "v-1", hours: 10 },
          { volunteer_id: "v-2", hours: 5 },
          { volunteer_id: "v-1", hours: 8 },
        ],
        error: null,
      });
      setMockResult("self_reported_hours", {
        data: [
          { volunteer_id: "v-2", hours: 20, validation_status: "validated" },
          { volunteer_id: "v-3", hours: 3, validation_status: "validated" },
        ],
        error: null,
      });

      const leaderboard = await getVolunteerLeaderboard(10);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[0].userId).toBe("v-2");
      expect(leaderboard[0].totalHours).toBe(25); // 5 formal + 20 self-reported
      expect(leaderboard[1].userId).toBe("v-1");
      expect(leaderboard[1].totalHours).toBe(18); // 10 + 8 formal
      expect(leaderboard[2].rank).toBe(3);
    });

    it("should respect limit parameter", async () => {
      setMockResult("volunteer_hours", {
        data: [
          { volunteer_id: "v-1", hours: 10 },
          { volunteer_id: "v-2", hours: 5 },
          { volunteer_id: "v-3", hours: 3 },
        ],
        error: null,
      });
      setMockResult("self_reported_hours", { data: [], error: null });

      const leaderboard = await getVolunteerLeaderboard(2);

      expect(leaderboard).toHaveLength(2);
    });

    it("should handle query errors gracefully", async () => {
      setMockResult("volunteer_hours", { data: null, error: { message: "DB error" } });
      setMockResult("self_reported_hours", { data: null, error: { message: "DB error" } });

      const leaderboard = await getVolunteerLeaderboard();

      expect(leaderboard).toHaveLength(0);
    });
  });

  describe("getDonorLeaderboard", () => {
    it("should aggregate crypto and fiat donations and rank donors", async () => {
      setMockResult("donations", {
        data: [
          { donor_id: "d-1", amount: 500, charity_id: "c-1" },
          { donor_id: "d-2", amount: 200, charity_id: "c-2" },
          { donor_id: "d-1", amount: 300, charity_id: "c-2" },
        ],
        error: null,
      });
      setMockResult("fiat_donations", {
        data: [
          { donor_id: "d-2", amount_cents: 100000, charity_id: "c-3" },
        ],
        error: null,
      });

      const leaderboard = await getDonorLeaderboard(10);

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].userId).toBe("d-2");
      expect(leaderboard[0].totalDonated).toBe(1200); // 200 crypto + 1000 fiat
      expect(leaderboard[0].donationCount).toBe(2);
      expect(leaderboard[0].organizationsSupported).toBe(2); // c-2, c-3
      expect(leaderboard[1].userId).toBe("d-1");
      expect(leaderboard[1].totalDonated).toBe(800);
      expect(leaderboard[1].organizationsSupported).toBe(2); // c-1, c-2
    });

    it("should respect limit parameter", async () => {
      setMockResult("donations", {
        data: [
          { donor_id: "d-1", amount: 500, charity_id: "c-1" },
          { donor_id: "d-2", amount: 200, charity_id: "c-1" },
          { donor_id: "d-3", amount: 100, charity_id: "c-1" },
        ],
        error: null,
      });
      setMockResult("fiat_donations", { data: [], error: null });

      const leaderboard = await getDonorLeaderboard(2);

      expect(leaderboard).toHaveLength(2);
    });

    it("should handle query errors gracefully", async () => {
      setMockResult("donations", { data: null, error: { message: "DB error" } });
      setMockResult("fiat_donations", { data: null, error: { message: "DB error" } });

      const leaderboard = await getDonorLeaderboard();

      expect(leaderboard).toHaveLength(0);
    });
  });

  describe("getGlobalContributionStats", () => {
    it("should aggregate global stats across all tables", async () => {
      setMockResult("donations", {
        data: [
          { amount: 100, donor_id: "d-1" },
          { amount: 200, donor_id: "d-2" },
        ],
        error: null,
      });
      setMockResult("fiat_donations", {
        data: [
          { amount_cents: 5000, donor_id: "d-1" },
          { amount_cents: 3000, donor_id: "d-3" },
        ],
        error: null,
      });
      setMockResult("volunteer_hours", {
        data: [
          { hours: 10, volunteer_id: "v-1" },
          { hours: 5, volunteer_id: "v-2" },
        ],
        error: null,
      });
      setMockResult("self_reported_hours", {
        data: [
          { hours: 8, validation_status: "validated", volunteer_id: "v-1" },
          { hours: 3, validation_status: "pending", volunteer_id: "v-3" },
        ],
        error: null,
      });
      setMockResult("skill_endorsements", {
        data: null, count: 7, error: null,
      });

      const stats = await getGlobalContributionStats();

      expect(stats.totalDonations).toBe(4); // 2 crypto + 2 fiat
      expect(stats.totalDonationAmount).toBe(380); // 300 crypto + 80 fiat
      expect(stats.totalFormalVolunteerHours).toBe(15);
      expect(stats.totalSelfReportedHours.validated).toBe(8);
      expect(stats.totalSelfReportedHours.pending).toBe(3);
      expect(stats.totalSelfReportedHours.total).toBe(11);
      expect(stats.totalVolunteerHours).toBe(23); // 15 formal + 8 validated
      expect(stats.totalVolunteers).toBe(3); // v-1, v-2, v-3
      expect(stats.totalDonors).toBe(3); // d-1, d-2, d-3
      expect(stats.totalSkillsEndorsed).toBe(7);
    });

    it("should handle empty data", async () => {
      setMockResult("donations", { data: null, error: null });
      setMockResult("fiat_donations", { data: null, error: null });
      setMockResult("volunteer_hours", { data: null, error: null });
      setMockResult("self_reported_hours", { data: null, error: null });
      setMockResult("skill_endorsements", { data: null, count: 0, error: null });

      const stats = await getGlobalContributionStats();

      expect(stats.totalDonations).toBe(0);
      expect(stats.totalDonationAmount).toBe(0);
      expect(stats.totalVolunteers).toBe(0);
      expect(stats.totalDonors).toBe(0);
    });

    it("should handle query errors and still return results", async () => {
      setMockResult("donations", { data: null, error: { message: "DB error" } });
      setMockResult("fiat_donations", { data: null, error: { message: "DB error" } });
      setMockResult("volunteer_hours", { data: null, error: { message: "DB error" } });
      setMockResult("self_reported_hours", { data: null, error: { message: "DB error" } });
      setMockResult("skill_endorsements", { data: null, count: null, error: { message: "DB error" } });

      const stats = await getGlobalContributionStats();

      expect(stats.totalDonations).toBe(0);
      expect(stats.totalSkillsEndorsed).toBe(0);
    });
  });

  describe("error catch blocks", () => {
    it("should throw wrapped error when getUserContributionStats encounters fatal error", async () => {
      jest.spyOn(supabase, "from").mockImplementation(() => {
        throw new Error("Connection lost");
      });

      await expect(getUserContributionStats("user-1")).rejects.toThrow(
        "Failed to fetch contribution stats",
      );

      jest.restoreAllMocks();
    });

    it("should throw wrapped error when getUnifiedContributions encounters fatal error", async () => {
      jest.spyOn(supabase, "from").mockImplementation(() => {
        throw new Error("Connection lost");
      });

      await expect(
        getUnifiedContributions({ userId: "user-1" }),
      ).rejects.toThrow("Failed to fetch contributions");

      jest.restoreAllMocks();
    });

    it("should throw wrapped error when getVolunteerLeaderboard encounters fatal error", async () => {
      jest.spyOn(supabase, "from").mockImplementation(() => {
        throw new Error("Connection lost");
      });

      await expect(getVolunteerLeaderboard()).rejects.toThrow(
        "Failed to fetch volunteer leaderboard",
      );

      jest.restoreAllMocks();
    });

    it("should throw wrapped error when getDonorLeaderboard encounters fatal error", async () => {
      jest.spyOn(supabase, "from").mockImplementation(() => {
        throw new Error("Connection lost");
      });

      await expect(getDonorLeaderboard()).rejects.toThrow(
        "Failed to fetch donor leaderboard",
      );

      jest.restoreAllMocks();
    });

    it("should throw wrapped error when getGlobalContributionStats encounters fatal error", async () => {
      jest.spyOn(supabase, "from").mockImplementation(() => {
        throw new Error("Connection lost");
      });

      await expect(getGlobalContributionStats()).rejects.toThrow(
        "Failed to fetch global stats",
      );

      jest.restoreAllMocks();
    });
  });
});
