import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  listOpportunities,
  listCauses,
} from "@/services/adminContentModerationService";
import AdminContentModeration from "./AdminContentModeration";

// adminContentModerationService, Card, LoadingSpinner, Modal, Button are mocked via moduleNameMapper

const mockListOpportunities = jest.mocked(listOpportunities);
const mockListCauses = jest.mocked(listCauses);

const mockOpportunity = {
  id: "opp-1",
  title: "Help at Food Bank",
  charityName: "Local Food Bank",
  moderationStatus: "visible" as const,
  createdAt: "2024-01-01T00:00:00Z",
};

const mockCause = {
  id: "cause-1",
  title: "Clean Water Project",
  charityName: "Water Charity",
  moderationStatus: "visible" as const,
  createdAt: "2024-01-01T00:00:00Z",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminContentModeration />
    </MemoryRouter>,
  );

describe("AdminContentModeration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListOpportunities.mockResolvedValue({
      opportunities: [],
      totalCount: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    mockListCauses.mockResolvedValue({
      causes: [],
      totalCount: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
  });

  describe("Renders", () => {
    it("renders the page heading", async () => {
      renderPage();
      expect(await screen.findByText("Content Moderation")).toBeInTheDocument();
    });

    it("renders Opportunities tab", async () => {
      renderPage();
      await screen.findByText("Content Moderation");
      expect(screen.getByText("Opportunities")).toBeInTheDocument();
    });

    it("renders Causes tab", async () => {
      renderPage();
      await screen.findByText("Content Moderation");
      expect(screen.getByText("Causes")).toBeInTheDocument();
    });

    it("shows empty state when no opportunities", async () => {
      renderPage();
      expect(
        await screen.findByText(/No opportunities found/i),
      ).toBeInTheDocument();
    });
  });

  describe("Tab switching", () => {
    it("switches to Causes tab when clicked", async () => {
      renderPage();
      await screen.findByText("Content Moderation");
      fireEvent.click(screen.getByText("Causes"));
      expect(await screen.findByText(/No causes found/i)).toBeInTheDocument();
    });

    it("switches back to Opportunities tab", async () => {
      renderPage();
      await screen.findByText("Content Moderation");
      fireEvent.click(screen.getByText("Causes"));
      await screen.findByText(/No causes found/i);
      fireEvent.click(screen.getByText("Opportunities"));
      expect(
        await screen.findByText(/No opportunities found/i),
      ).toBeInTheDocument();
    });
  });

  describe("Filter controls", () => {
    it("renders status filter in opportunities tab", async () => {
      renderPage();
      await screen.findByText("Content Moderation");
      expect(screen.getByLabelText("Filter by visibility")).toBeInTheDocument();
    });

    it("renders search input in opportunities tab", async () => {
      renderPage();
      await screen.findByText("Content Moderation");
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });
  });

  describe("Content list", () => {
    it("renders opportunity title when opportunities exist", async () => {
      mockListOpportunities.mockResolvedValue({
        opportunities: [mockOpportunity],
        totalCount: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      });
      const { findByText } = renderPage();
      expect(await findByText("Help at Food Bank")).toBeInTheDocument();
    });

    it("renders cause title when causes exist", async () => {
      mockListCauses.mockResolvedValue({
        causes: [mockCause],
        totalCount: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      });
      const { findByText } = renderPage();
      await screen.findByText("Content Moderation");
      fireEvent.click(screen.getByText("Causes"));
      expect(await findByText("Clean Water Project")).toBeInTheDocument();
    });
  });
});
