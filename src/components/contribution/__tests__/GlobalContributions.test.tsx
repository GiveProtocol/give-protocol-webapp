import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

// Define mock return value holder
let mockReturnValue: {
  data: object | null;
  isLoading: boolean;
  error: Error | null;
} = {
  data: null,
  isLoading: true,
  error: null,
};

// Mock the hook module before importing the component
jest.mock("@/hooks/useContributionStats", () => ({
  useGlobalContributionStats: () => mockReturnValue,
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

// Import component AFTER mocks are set up
import { GlobalContributions } from "../GlobalContributions";

const mockGlobalStats = {
  totalDonationAmount: 1000,
  totalFormalVolunteerHours: 50,
  totalSelfReportedHours: { validated: 20, pending: 5, total: 25 },
  totalVolunteerHours: 75,
};

describe("GlobalContributions", () => {
  beforeEach(() => {
    // Reset to default loading state before each test
    mockReturnValue = {
      data: null,
      isLoading: true,
      error: null,
    };
  });

  it("renders loading spinner when loading", () => {
    render(<GlobalContributions />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders donation stats when data is loaded", () => {
    mockReturnValue = {
      data: mockGlobalStats,
      isLoading: false,
      error: null,
    };

    render(<GlobalContributions />);

    expect(screen.getByTestId("donation-stats")).toBeInTheDocument();
    expect(screen.getByText("Stats loaded")).toBeInTheDocument();
  });

  it("renders leaderboards when data is loaded", () => {
    mockReturnValue = {
      data: mockGlobalStats,
      isLoading: false,
      error: null,
    };

    render(<GlobalContributions />);

    expect(screen.getByTestId("donation-leaderboard")).toBeInTheDocument();
    expect(screen.getByTestId("volunteer-leaderboard")).toBeInTheDocument();
  });

  it("renders error message when there is an error", () => {
    mockReturnValue = {
      data: null,
      isLoading: false,
      error: new Error("Failed to load"),
    };

    render(<GlobalContributions />);

    expect(
      screen.getByText("Error loading global stats. Please try again."),
    ).toBeInTheDocument();
  });

  it("renders DonationStats with no stats when data is null", () => {
    mockReturnValue = {
      data: null,
      isLoading: false,
      error: null,
    };

    render(<GlobalContributions />);

    expect(screen.getByTestId("donation-stats")).toBeInTheDocument();
    expect(screen.getByText("No stats")).toBeInTheDocument();
  });
});
