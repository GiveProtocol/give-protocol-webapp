import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  setMockResult,
  resetMockState,
} from "@/test-utils/supabaseMock";
import {
  getVolunteerLeaderboard,
  getDonorLeaderboard,
  getGlobalContributionStats,
} from "./contributionAggregationService";

describe("contributionAggregationService - privacy filtering", () => {
  beforeEach(() => {
    resetMockState();
  });

  it("should exclude private users from volunteer leaderboard", async () => {
    setMockResult("user_preferences", {
      data: [
        { user_id: "v-2", privacy_settings: { publicProfile: false, showVolunteerHours: true } },
      ],
      error: null,
    });
    setMockResult("volunteer_hours", {
      data: [
        { volunteer_id: "v-1", hours: 10 },
        { volunteer_id: "v-2", hours: 50 },
        { volunteer_id: "v-3", hours: 5 },
      ],
      error: null,
    });
    setMockResult("self_reported_hours", { data: [], error: null });

    const leaderboard = await getVolunteerLeaderboard(10);

    expect(leaderboard).toHaveLength(2);
    expect(leaderboard[0].userId).toBe("v-1");
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[1].userId).toBe("v-3");
    expect(leaderboard[1].rank).toBe(2);
    expect(leaderboard.find((e) => e.userId === "v-2")).toBeUndefined();
  });

  it("should exclude users who hide donations from donor leaderboard", async () => {
    setMockResult("user_preferences", {
      data: [
        { user_id: "d-1", privacy_settings: { publicProfile: true, showDonations: false } },
      ],
      error: null,
    });
    setMockResult("donations", {
      data: [
        { donor_id: "d-1", amount: 1000, charity_id: "c-1" },
        { donor_id: "d-2", amount: 200, charity_id: "c-1" },
      ],
      error: null,
    });
    setMockResult("fiat_donations", { data: [], error: null });

    const leaderboard = await getDonorLeaderboard(10);

    expect(leaderboard).toHaveLength(1);
    expect(leaderboard[0].userId).toBe("d-2");
    expect(leaderboard[0].rank).toBe(1);
  });

  it("should exclude private donors from global stats", async () => {
    setMockResult("user_preferences", {
      data: [
        { user_id: "d-1", privacy_settings: { publicProfile: false, showDonations: true } },
      ],
      error: null,
    });
    setMockResult("donations", {
      data: [
        { amount: 500, donor_id: "d-1" },
        { amount: 200, donor_id: "d-2" },
      ],
      error: null,
    });
    setMockResult("fiat_donations", { data: [], error: null });
    setMockResult("volunteer_hours", { data: [], error: null });
    setMockResult("self_reported_hours", { data: [], error: null });
    setMockResult("skill_endorsements", { data: null, count: 0, error: null });

    const stats = await getGlobalContributionStats();

    expect(stats.totalDonationAmount).toBe(200);
    expect(stats.totalDonations).toBe(1);
    expect(stats.totalDonors).toBe(1);
  });

  it("should exclude private volunteers from global stats", async () => {
    setMockResult("user_preferences", {
      data: [
        { user_id: "v-1", privacy_settings: { publicProfile: true, showVolunteerHours: false } },
      ],
      error: null,
    });
    setMockResult("donations", { data: [], error: null });
    setMockResult("fiat_donations", { data: [], error: null });
    setMockResult("volunteer_hours", {
      data: [
        { hours: 10, volunteer_id: "v-1" },
        { hours: 5, volunteer_id: "v-2" },
      ],
      error: null,
    });
    setMockResult("self_reported_hours", { data: [], error: null });
    setMockResult("skill_endorsements", { data: null, count: 0, error: null });

    const stats = await getGlobalContributionStats();

    expect(stats.totalFormalVolunteerHours).toBe(5);
    expect(stats.totalVolunteers).toBe(1);
  });

  it("should include all users when no privacy preferences exist", async () => {
    setMockResult("user_preferences", { data: [], error: null });
    setMockResult("donations", {
      data: [{ donor_id: "d-1", amount: 100, charity_id: "c-1" }],
      error: null,
    });
    setMockResult("fiat_donations", { data: [], error: null });

    const leaderboard = await getDonorLeaderboard(10);

    expect(leaderboard).toHaveLength(1);
  });

  it("should respect limit after privacy filtering", async () => {
    setMockResult("user_preferences", {
      data: [
        { user_id: "v-3", privacy_settings: { publicProfile: false } },
      ],
      error: null,
    });
    setMockResult("volunteer_hours", {
      data: [
        { volunteer_id: "v-1", hours: 10 },
        { volunteer_id: "v-2", hours: 8 },
        { volunteer_id: "v-3", hours: 50 },
        { volunteer_id: "v-4", hours: 6 },
      ],
      error: null,
    });
    setMockResult("self_reported_hours", { data: [], error: null });

    const leaderboard = await getVolunteerLeaderboard(2);

    expect(leaderboard).toHaveLength(2);
    expect(leaderboard[0].userId).toBe("v-1");
    expect(leaderboard[1].userId).toBe("v-2");
  });

  it("should handle privacy preferences database error gracefully", async () => {
    setMockResult("user_preferences", {
      data: null,
      error: { message: "Database error" },
    });
    setMockResult("donations", {
      data: [
        { donor_id: "d-1", amount: 100, charity_id: "c-1" },
        { donor_id: "d-2", amount: 200, charity_id: "c-1" },
      ],
      error: null,
    });
    setMockResult("fiat_donations", { data: [], error: null });

    const leaderboard = await getDonorLeaderboard(10);

    // On privacy error, default to showing all users (fail-open for display)
    expect(leaderboard).toHaveLength(2);
  });
});
