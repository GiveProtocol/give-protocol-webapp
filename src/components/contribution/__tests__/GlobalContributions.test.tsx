import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { GlobalContributions } from "../GlobalContributions";
import { useGlobalContributionStats } from "@/hooks/useContributionStats";

jest.mock("@/hooks/useContributionStats", () => ({
  useGlobalContributionStats: jest.fn(),
}));

jest.mock("../DonationStats", () => ({
  DonationStats: ({ stats }: { stats?: object }) => (
    <div data-testid="donation-stats">
      {stats ? "Stats loaded" : "No stats"}
    </div>
  ),
}));

jest.mock("../DonationLeaderboard", () => ({
  DonationLeaderboard: () => (
    <div data-testid="donation-leaderboard">Donation Leaderboard</div>
  ),
}));

jest.mock("../VolunteerLeaderboard", () => ({
  VolunteerLeaderboard: () => (
    <div data-testid="volunteer-leaderboard">Volunteer Leaderboard</div>
  ),
}));

jest.mock("@/components/ui/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const mockUseGlobalContributionStats = jest.mocked(
  useGlobalContributionStats,
);

const mockGlobalStats = {
  totalDonationAmount: 1000,
  totalFormalVolunteerHours: 50,
  totalSelfReportedHours: { validated: 20, pending: 5, total: 25 },
  totalVolunteerHours: 75,
};

describe("GlobalContributions", () => {
  beforeEach(() => {
    mockUseGlobalContributionStats.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useGlobalContributionStats>);
  });

  it("renders loading spinner when loading", () => {
    render(<GlobalContributions />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders donation stats when data is loaded", () => {
    mockUseGlobalContributionStats.mockReturnValue({
      data: mockGlobalStats,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useGlobalContributionStats>);

    render(<GlobalContributions />);

    expect(screen.getByTestId("donation-stats")).toBeInTheDocument();
    expect(screen.getByText("Stats loaded")).toBeInTheDocument();
  });

  it("renders leaderboards when data is loaded", () => {
    mockUseGlobalContributionStats.mockReturnValue({
      data: mockGlobalStats,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useGlobalContributionStats>);

    render(<GlobalContributions />);

    expect(screen.getByTestId("donation-leaderboard")).toBeInTheDocument();
    expect(screen.getByTestId("volunteer-leaderboard")).toBeInTheDocument();
  });

  it("renders error message when there is an error", () => {
    mockUseGlobalContributionStats.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to load"),
    } as ReturnType<typeof useGlobalContributionStats>);

    render(<GlobalContributions />);

    expect(
      screen.getByText("Error loading global stats. Please try again."),
    ).toBeInTheDocument();
  });

  it("renders DonationStats with no stats when data is null", () => {
    mockUseGlobalContributionStats.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useGlobalContributionStats>);

    render(<GlobalContributions />);

    expect(screen.getByTestId("donation-stats")).toBeInTheDocument();
    expect(screen.getByText("No stats")).toBeInTheDocument();
  });
});
