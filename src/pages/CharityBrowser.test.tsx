import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useGeographicFilterParams } from "@/hooks/useGeographicFilterParams";
import { resolveLocation } from "@/utils/locationResolver";
import CharityBrowser from "./CharityBrowser";

// CharityGrid, PortfolioGrid, CauseGrid, GeographicFilter, ScrollReveal,
// Button, useGeographicFilterParams, resolveLocation are all mocked via moduleNameMapper

const mockUseGeographicFilterParams = jest.mocked(useGeographicFilterParams);
const mockResolveLocation = jest.mocked(resolveLocation);

const renderPage = () =>
  render(
    <MemoryRouter>
      <CharityBrowser />
    </MemoryRouter>,
  );

describe("CharityBrowser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGeographicFilterParams.mockReturnValue({
      filterState: "all",
      filterCountry: null,
    });
    mockResolveLocation.mockImplementation((input) => ({
      id: input,
      type: "country",
      label: input,
    }));
  });

  describe("Renders", () => {
    it("renders the page heading", () => {
      renderPage();
      expect(
        screen.getByText("Discover Impact Opportunities"),
      ).toBeInTheDocument();
    });

    it("renders Charities button", () => {
      renderPage();
      expect(screen.getByText("Charities")).toBeInTheDocument();
    });

    it("renders Causes button", () => {
      renderPage();
      expect(screen.getByText("Causes")).toBeInTheDocument();
    });

    it("renders Portfolio Funds button", () => {
      renderPage();
      expect(screen.getByText("Portfolio Funds")).toBeInTheDocument();
    });

    it("renders search input", () => {
      renderPage();
      expect(screen.getByLabelText("Search charities")).toBeInTheDocument();
    });

    it("renders charity grid by default", () => {
      renderPage();
      expect(screen.getByTestId("charity-grid")).toBeInTheDocument();
    });

    it("renders location search input in charities view", () => {
      renderPage();
      expect(screen.getByLabelText("Search location")).toBeInTheDocument();
    });

    it("renders geographic filter in charities view", () => {
      renderPage();
      expect(screen.getByTestId("geographic-filter")).toBeInTheDocument();
    });
  });

  describe("View mode switching", () => {
    it("shows cause grid when Causes is clicked", () => {
      renderPage();
      fireEvent.click(screen.getByText("Causes"));
      expect(screen.getByTestId("cause-grid")).toBeInTheDocument();
    });

    it("hides charity grid when Causes is selected", () => {
      renderPage();
      fireEvent.click(screen.getByText("Causes"));
      expect(screen.queryByTestId("charity-grid")).not.toBeInTheDocument();
    });

    it("shows portfolio grid when Portfolio Funds is clicked", () => {
      renderPage();
      fireEvent.click(screen.getByText("Portfolio Funds"));
      expect(screen.getByTestId("portfolio-grid")).toBeInTheDocument();
    });

    it("hides location search in causes view", () => {
      renderPage();
      fireEvent.click(screen.getByText("Causes"));
      expect(
        screen.queryByLabelText("Search location"),
      ).not.toBeInTheDocument();
    });

    it("hides geographic filter in portfolio view", () => {
      renderPage();
      fireEvent.click(screen.getByText("Portfolio Funds"));
      expect(screen.queryByTestId("geographic-filter")).not.toBeInTheDocument();
    });

    it("returns to charity grid when Charities is clicked after switching", () => {
      renderPage();
      fireEvent.click(screen.getByText("Causes"));
      fireEvent.click(screen.getByText("Charities"));
      expect(screen.getByTestId("charity-grid")).toBeInTheDocument();
    });
  });

  describe("Search", () => {
    it("updates search term when typing in search input", () => {
      renderPage();
      const input = screen.getByLabelText("Search charities");
      fireEvent.change(input, { target: { value: "water" } });
      expect(input).toHaveValue("water");
    });

    it("updates location input when typing", () => {
      renderPage();
      const locationInput = screen.getByLabelText("Search location");
      fireEvent.change(locationInput, { target: { value: "Kenya" } });
      expect(locationInput).toHaveValue("Kenya");
    });

    it("calls resolveLocation when Enter is pressed in location input", () => {
      renderPage();
      const locationInput = screen.getByLabelText("Search location");
      fireEvent.change(locationInput, { target: { value: "Kenya" } });
      fireEvent.keyDown(locationInput, { key: "Enter" });
      expect(mockResolveLocation).toHaveBeenCalledWith("Kenya");
    });

    it("clears location input after Enter is pressed", () => {
      renderPage();
      const locationInput = screen.getByLabelText("Search location");
      fireEvent.change(locationInput, { target: { value: "Kenya" } });
      fireEvent.keyDown(locationInput, { key: "Enter" });
      expect(locationInput).toHaveValue("");
    });

    it("does not call resolveLocation when Enter pressed with empty input", () => {
      renderPage();
      const locationInput = screen.getByLabelText("Search location");
      fireEvent.keyDown(locationInput, { key: "Enter" });
      expect(mockResolveLocation).not.toHaveBeenCalled();
    });
  });
});
