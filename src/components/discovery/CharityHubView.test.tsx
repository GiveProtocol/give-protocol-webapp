import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CharityHubView } from "./CharityHubView";

describe("CharityHubView", () => {
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

  it("renders the revenue snapshot bar with stat tiles", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Funds Raised")).toBeInTheDocument();
    expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Donor Count")).toBeInTheDocument();
  });

  it("renders the engagement velocity chart heading", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Engagement Velocity")).toBeInTheDocument();
  });

  it("renders the compliance rail in the side rail", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Compliance & Trust")).toBeInTheDocument();
  });

  it("renders the platform news section in the side rail", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Platform News")).toBeInTheDocument();
  });

  it("shows pending KYC status when profile is null", () => {
    render(
      <MemoryRouter>
        <CharityHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Pending review")).toBeInTheDocument();
  });
});
