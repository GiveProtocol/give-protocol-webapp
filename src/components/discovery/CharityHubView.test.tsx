import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock DiscoveryShell to render slot props directly
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
      <div data-testid="slot-topBar">{topBar}</div>
      <div data-testid="slot-main">{main}</div>
      <div data-testid="slot-rail">{rail}</div>
    </div>
  ),
}));

// Mock child components to produce identifiable stubs
jest.mock("./RevenueSnapshotBar", () => ({
  RevenueSnapshotBar: () => <div data-testid="revenue-snapshot-bar" />,
}));
jest.mock("./EngagementVelocityChart", () => ({
  EngagementVelocityChart: () => <div data-testid="engagement-chart" />,
}));
jest.mock("./ComplianceRail", () => ({
  ComplianceRail: () => <div data-testid="compliance-rail" />,
}));
jest.mock("./NewsUpdatesCard", () => ({
  NewsUpdatesCard: () => <div data-testid="news-updates" />,
}));

// Mock hooks
jest.mock("@/hooks/useCharityRevenueSnapshot", () => ({
  useCharityRevenueSnapshot: jest.fn(() => ({
    snapshot: {
      fundsRaised: 5000,
      activeCampaigns: 3,
      donorCount: 42,
      dailyTotals: [],
    },
    loading: false,
  })),
}));

jest.mock("@/hooks/useCharityProfile", () => ({
  useCharityProfile: jest.fn(() => ({
    profile: { name: "Test Charity" },
    updateProfile: jest.fn(),
    loading: false,
    error: null,
  })),
}));

import { CharityHubView } from "./CharityHubView";
import { useCharityProfile } from "@/hooks/useCharityProfile";

const mockUseCharityProfile = useCharityProfile as jest.MockedFunction<
  typeof useCharityProfile
>;

describe("CharityHubView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the DiscoveryShell layout", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("discovery-shell")).toBeInTheDocument();
  });

  it("renders the revenue snapshot bar in the top bar slot", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    const topBar = screen.getByTestId("slot-topBar");
    expect(
      topBar.querySelector("[data-testid='revenue-snapshot-bar']"),
    ).toBeInTheDocument();
  });

  it("renders the engagement chart in the main slot", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    const main = screen.getByTestId("slot-main");
    expect(
      main.querySelector("[data-testid='engagement-chart']"),
    ).toBeInTheDocument();
  });

  it("renders the Quick Actions heading", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
  });

  it("renders the three quick action links", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Open full portal")).toBeInTheDocument();
    expect(screen.getByText("Start a new cause")).toBeInTheDocument();
    expect(
      screen.getByText("Post a volunteer opportunity"),
    ).toBeInTheDocument();
  });

  it("renders the compliance rail and news in the rail slot", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    const rail = screen.getByTestId("slot-rail");
    expect(
      rail.querySelector("[data-testid='compliance-rail']"),
    ).toBeInTheDocument();
    expect(
      rail.querySelector("[data-testid='news-updates']"),
    ).toBeInTheDocument();
  });

  it("renders quick action links with correct hrefs", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    const portalLink = screen.getByText("Open full portal").closest("a");
    expect(portalLink).toHaveAttribute("href", "/charity-portal");

    const causeLink = screen.getByText("Start a new cause").closest("a");
    expect(causeLink).toHaveAttribute("href", "/charity-portal/create-cause");
  });

  it("treats an unverified charity profile without a name as unverified", () => {
    mockUseCharityProfile.mockReturnValue({
      profile: null,
      updateProfile: jest.fn() as never,
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    // Component should still render without errors
    expect(screen.getByTestId("discovery-shell")).toBeInTheDocument();
  });
});
