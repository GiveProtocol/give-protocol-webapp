import { jest } from "@jest/globals";
import React from "react";
import { render, screen } from "@testing-library/react";
import { useDonorData } from "@/hooks/useDonorData";
import { useCharityOrganizationSearch } from "@/hooks/useCharityOrganizationSearch";

// Mock sub-components to isolate the view logic
jest.mock("./DiscoveryShell", () => ({
  DiscoveryShell: ({
    topBar,
    main,
    rail,
  }: {
    topBar?: React.ReactNode;
    main: React.ReactNode;
    rail?: React.ReactNode;
  }) => (
    <div data-testid="discovery-shell">
      {topBar !== undefined && topBar !== null && (
        <div data-testid="shell-topbar">{topBar}</div>
      )}
      <div data-testid="shell-main">{main}</div>
      {rail !== undefined && rail !== null && (
        <div data-testid="shell-rail">{rail}</div>
      )}
    </div>
  ),
}));

jest.mock("./DonorStatBar", () => ({
  DonorStatBar: ({
    totalImpact,
    activeRecurringGrants,
    givingStreakMonths,
  }: {
    totalImpact: number;
    activeRecurringGrants: number;
    givingStreakMonths: number;
  }) => (
    <div data-testid="donor-stat-bar">
      <span data-testid="total-impact">{totalImpact}</span>
      <span data-testid="recurring-grants">{activeRecurringGrants}</span>
      <span data-testid="streak">{givingStreakMonths}</span>
    </div>
  ),
}));

jest.mock("./DiscoveryFilters", () => ({
  DiscoveryFilters: () => <div data-testid="discovery-filters" />,
}));

jest.mock("./ProjectCard", () => ({
  ProjectCard: ({ organization }: { organization: { name: string } }) => (
    <div data-testid="project-card">{organization.name}</div>
  ),
}));

jest.mock("./DailyWisdomCard", () => ({
  DailyWisdomCard: () => <div data-testid="daily-wisdom" />,
}));

jest.mock("./NewsUpdatesCard", () => ({
  NewsUpdatesCard: () => <div data-testid="news-card" />,
}));

jest.mock("@/hooks/useGivingStreak", () => ({
  useGivingStreak: () => 3,
}));

jest.mock("@/hooks/useScheduledDonations", () => ({
  useScheduledDonations: () => ({ count: 2, loading: false }),
}));

jest.mock("@/hooks/useGeographicFilterParams", () => ({
  useGeographicFilterParams: () => ({
    filterState: "",
    filterCountry: "",
    hasGeoFilter: false,
  }),
}));

import { DonorHubView } from "./DonorHubView";

const mockUseDonorData = useDonorData as jest.MockedFunction<
  typeof useDonorData
>;
const mockSearch = useCharityOrganizationSearch as jest.MockedFunction<
  typeof useCharityOrganizationSearch
>;

describe("DonorHubView", () => {
  beforeEach(() => {
    mockUseDonorData.mockReset();
    mockSearch.mockReset();
    mockUseDonorData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    mockSearch.mockReturnValue({
      organizations: [],
      loading: false,
      hasMore: false,
      error: null,
      loadMore: jest.fn(),
    });
  });

  it("renders within the DiscoveryShell", () => {
    render(<DonorHubView />);
    expect(screen.getByTestId("discovery-shell")).toBeInTheDocument();
  });

  it("renders the DonorStatBar in the top bar", () => {
    render(<DonorHubView />);
    expect(screen.getByTestId("donor-stat-bar")).toBeInTheDocument();
  });

  it("passes totalImpact 0 when data is null", () => {
    render(<DonorHubView />);
    expect(screen.getByTestId("total-impact").textContent).toBe("0");
  });

  it("passes totalDonated to DonorStatBar when data is available", () => {
    mockUseDonorData.mockReturnValue({
      data: { totalDonated: 500, donations: [] },
      loading: false,
      error: null,
    } as ReturnType<typeof useDonorData>);
    render(<DonorHubView />);
    expect(screen.getByTestId("total-impact").textContent).toBe("500");
  });

  it("renders the Personalized for You heading", () => {
    render(<DonorHubView />);
    expect(screen.getByText("Personalized for You")).toBeInTheDocument();
  });

  it("shows 'Trending on the platform' when no history hint exists", () => {
    render(<DonorHubView />);
    expect(screen.getByText("Trending on the platform")).toBeInTheDocument();
  });

  it("shows 'Based on your recent giving' when donation history provides a hint", () => {
    mockUseDonorData.mockReturnValue({
      data: {
        totalDonated: 100,
        donations: [
          { charity: "RedCross Foundation", date: "2026-01-15", amount: 50 },
        ],
      },
      loading: false,
      error: null,
    } as ReturnType<typeof useDonorData>);
    render(<DonorHubView />);
    expect(screen.getByText("Based on your recent giving")).toBeInTheDocument();
  });

  it("renders the discovery filters", () => {
    render(<DonorHubView />);
    expect(screen.getByTestId("discovery-filters")).toBeInTheDocument();
  });

  it("renders project cards when organizations are returned", () => {
    mockSearch.mockReturnValue({
      organizations: [{ ein: "12-345", name: "Test Org" }] as ReturnType<
        typeof useCharityOrganizationSearch
      >["organizations"],
      loading: false,
      hasMore: false,
      error: null,
      loadMore: jest.fn(),
    });
    render(<DonorHubView />);
    expect(screen.getByTestId("project-card")).toBeInTheDocument();
    expect(screen.getByText("Test Org")).toBeInTheDocument();
  });

  it("shows skeleton when loading with no organizations", () => {
    mockSearch.mockReturnValue({
      organizations: [],
      loading: true,
      hasMore: false,
      error: null,
      loadMore: jest.fn(),
    });
    render(<DonorHubView />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("shows empty-state message when no matches and not loading", () => {
    mockSearch.mockReturnValue({
      organizations: [],
      loading: false,
      hasMore: false,
      error: null,
      loadMore: jest.fn(),
    });
    render(<DonorHubView />);
    expect(
      screen.getByText(/No matches yet\. Try a different search/),
    ).toBeInTheDocument();
  });

  it("renders the rail with DailyWisdomCard and NewsUpdatesCard", () => {
    render(<DonorHubView />);
    expect(screen.getByTestId("daily-wisdom")).toBeInTheDocument();
    expect(screen.getByTestId("news-card")).toBeInTheDocument();
  });

  it("passes recurring grant count from useScheduledDonations", () => {
    render(<DonorHubView />);
    expect(screen.getByTestId("recurring-grants").textContent).toBe("2");
  });

  it("passes giving streak months from useGivingStreak", () => {
    render(<DonorHubView />);
    expect(screen.getByTestId("streak").textContent).toBe("3");
  });
});
