import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { CharityOrganization } from "@/types/charityOrganization";
import { ProjectCard } from "./ProjectCard";

const makeOrg = (overrides: Partial<CharityOrganization> = {}): CharityOrganization => ({
  id: "id-1",
  ein: "12-3456789",
  name: "Test Charity",
  city: "Boston",
  state: "MA",
  zip: "02101",
  ntee_cd: "A",
  deductibility: "1",
  is_on_platform: false,
  platform_charity_id: null,
  rank: 1,
  country: "US",
  registry_source: "IRS_BMF",
  data_source: null,
  data_vintage: null,
  last_synced_at: null,
  ...overrides,
});

describe("ProjectCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the organization name as a link to the charity detail page", () => {
    const org = makeOrg({ ein: "11-1111111", name: "Good Cause" });
    render(
      <MemoryRouter>
        <ProjectCard organization={org} />
      </MemoryRouter>,
    );
    const nameLink = screen.getByText("Good Cause");
    expect(nameLink).toBeInTheDocument();
    expect(nameLink.closest("a")).toHaveAttribute("href", "/charity/11-1111111");
  });

  it("renders the EIN", () => {
    const org = makeOrg({ ein: "22-2222222" });
    render(
      <MemoryRouter>
        <ProjectCard organization={org} />
      </MemoryRouter>,
    );
    expect(screen.getByText("EIN: 22-2222222")).toBeInTheDocument();
  });

  it("renders the Donate link with action=donate query param", () => {
    const org = makeOrg({ ein: "33-3333333" });
    render(
      <MemoryRouter>
        <ProjectCard organization={org} />
      </MemoryRouter>,
    );
    const donateLink = screen.getByText("Donate");
    expect(donateLink.closest("a")).toHaveAttribute(
      "href",
      "/charity/33-3333333?action=donate",
    );
  });

  it("renders the Verified badge when is_on_platform is true", () => {
    const org = makeOrg({ is_on_platform: true });
    render(
      <MemoryRouter>
        <ProjectCard organization={org} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("does not render the Verified badge when is_on_platform is false", () => {
    const org = makeOrg({ is_on_platform: false });
    render(
      <MemoryRouter>
        <ProjectCard organization={org} />
      </MemoryRouter>,
    );
    expect(screen.queryByText("Verified")).not.toBeInTheDocument();
  });

  it("renders location when city, state, and zip are present", () => {
    const org = makeOrg({ city: "Springfield", state: "IL", zip: "62701" });
    render(
      <MemoryRouter>
        <ProjectCard organization={org} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Springfield, IL, 62701")).toBeInTheDocument();
  });

  it("does not render location when city, state, and zip are all null", () => {
    const org = makeOrg({ city: null, state: null, zip: null });
    render(
      <MemoryRouter>
        <ProjectCard organization={org} />
      </MemoryRouter>,
    );
    // No MapPin location line should appear
    expect(screen.queryByText(",")).not.toBeInTheDocument();
  });
});
