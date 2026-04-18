import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CharityBrowser from "../CharityBrowser";

// CharityGrid, CauseGrid, PortfolioGrid, GeographicFilter render with real
// implementations. Their leaf dependencies (useCharityOrganizationSearch,
// Button, Card, LoadingSpinner) are already mocked via moduleNameMapper.
// ScrollReveal uses IntersectionObserver which is mocked in jest.setup.ts.

const renderCharityBrowser = () =>
  render(
    <MemoryRouter>
      <CharityBrowser />
    </MemoryRouter>,
  );

describe("CharityBrowser", () => {
  describe("Page heading", () => {
    it("renders the page title", () => {
      renderCharityBrowser();
      expect(
        screen.getByText("Discover Impact Opportunities"),
      ).toBeInTheDocument();
    });
  });

  describe("View mode buttons", () => {
    it("renders the Charities button", () => {
      renderCharityBrowser();
      expect(screen.getByText("Charities")).toBeInTheDocument();
    });

    it("renders the Causes button", () => {
      renderCharityBrowser();
      expect(screen.getByText("Causes")).toBeInTheDocument();
    });

    it("renders the Portfolio Funds button", () => {
      renderCharityBrowser();
      expect(screen.getByText("Portfolio Funds")).toBeInTheDocument();
    });
  });

  describe("Search input", () => {
    it("renders the search input", () => {
      renderCharityBrowser();
      expect(
        screen.getByRole("textbox", { name: "Search charities" }),
      ).toBeInTheDocument();
    });

    it("renders the location input in charities view", () => {
      renderCharityBrowser();
      expect(
        screen.getByRole("textbox", { name: "Search location" }),
      ).toBeInTheDocument();
    });
  });

  describe("Tab switching", () => {
    it("hides location input when Causes tab is selected", () => {
      renderCharityBrowser();
      fireEvent.click(screen.getByText("Causes"));
      expect(
        screen.queryByRole("textbox", { name: "Search location" }),
      ).not.toBeInTheDocument();
    });

    it("hides location input when Portfolio Funds tab is selected", () => {
      renderCharityBrowser();
      fireEvent.click(screen.getByText("Portfolio Funds"));
      expect(
        screen.queryByRole("textbox", { name: "Search location" }),
      ).not.toBeInTheDocument();
    });

    it("shows location input when switching back to Charities tab", () => {
      renderCharityBrowser();
      fireEvent.click(screen.getByText("Causes"));
      fireEvent.click(screen.getByText("Charities"));
      expect(
        screen.getByRole("textbox", { name: "Search location" }),
      ).toBeInTheDocument();
    });
  });
});
