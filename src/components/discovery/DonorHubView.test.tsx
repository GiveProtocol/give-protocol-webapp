import { jest } from "@jest/globals";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useDonorData } from "@/hooks/useDonorData";
import { DonorHubView } from "./DonorHubView";

const mockUseDonorData = useDonorData as jest.MockedFunction<
  typeof useDonorData
>;

describe("DonorHubView", () => {
  beforeEach(() => {
    mockUseDonorData.mockReset();
    mockUseDonorData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
  });

  it("renders the Personalized for You heading", () => {
    render(
      <MemoryRouter>
        <DonorHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Personalized for You")).toBeInTheDocument();
  });

  it("shows 'Trending on the platform' when no donation history", () => {
    render(
      <MemoryRouter>
        <DonorHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Trending on the platform")).toBeInTheDocument();
  });

  it("shows 'Based on your recent giving' when donation history exists", () => {
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
    render(
      <MemoryRouter>
        <DonorHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Based on your recent giving")).toBeInTheDocument();
  });

  it("renders the DonorStatBar with impact stats", () => {
    render(
      <MemoryRouter>
        <DonorHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Total Impact")).toBeInTheDocument();
    expect(screen.getByText("Active Recurring Grants")).toBeInTheDocument();
    expect(screen.getByText("Giving Consistency")).toBeInTheDocument();
  });

  it("renders zero impact when donor data is null", () => {
    render(
      <MemoryRouter>
        <DonorHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("$0")).toBeInTheDocument();
    expect(screen.getByText("0 mo")).toBeInTheDocument();
  });

  it("renders totalDonated when donor data is available", () => {
    mockUseDonorData.mockReturnValue({
      data: { totalDonated: 500, donations: [] },
      loading: false,
      error: null,
    } as ReturnType<typeof useDonorData>);
    render(
      <MemoryRouter>
        <DonorHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("$500")).toBeInTheDocument();
  });

  it("shows empty-state message when no matches and not loading", () => {
    render(
      <MemoryRouter>
        <DonorHubView />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/No matches yet\. Try a different search/),
    ).toBeInTheDocument();
  });

  it("renders the DailyWisdomCard in the rail", () => {
    render(
      <MemoryRouter>
        <DonorHubView />
      </MemoryRouter>,
    );
    // DailyWisdomCard renders a blockquote with a generosity quote
    const blockquote = document.querySelector("blockquote");
    expect(blockquote).toBeInTheDocument();
  });

  it("renders the NewsUpdatesCard in the rail", () => {
    render(
      <MemoryRouter>
        <DonorHubView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Platform News")).toBeInTheDocument();
  });
});
