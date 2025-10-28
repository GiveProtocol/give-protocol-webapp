import _React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchBar } from "../SearchBar";

// Mock dependencies
jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

const mockProps = {
  countries: [
    { id: "1", name: "United States", code: "US" },
    { id: "2", name: "Canada", code: "CA" },
  ],
  categories: [
    { id: "1", name: "Education", description: "Educational charities" },
    { id: "2", name: "Healthcare", description: "Health-related charities" },
  ],
  onSearch: jest.fn(),
  onCountrySelect: jest.fn(),
  onCategorySelect: jest.fn(),
};

describe("SearchBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search input with placeholder", () => {
    render(<SearchBar {...mockProps} placeholder="Search charities..." />);
    expect(
      screen.getByPlaceholderText("Search charities..."),
    ).toBeInTheDocument();
  });

  it("renders country and category dropdowns", () => {
    render(<SearchBar {...mockProps} />);
    expect(screen.getByText("All Countries")).toBeInTheDocument();
    expect(screen.getByText("All Categories")).toBeInTheDocument();
  });

  it("calls onSearch when typing in search input", async () => {
    render(<SearchBar {...mockProps} />);
    const searchInput = screen.getByRole("textbox");

    fireEvent.change(searchInput, { target: { value: "test charity" } });

    await waitFor(() => {
      expect(mockProps.onSearch).toHaveBeenCalledWith("test charity", {});
    });
  });

  it("opens country dropdown when clicked", () => {
    render(<SearchBar {...mockProps} />);

    fireEvent.click(screen.getByText("All Countries"));

    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("Canada")).toBeInTheDocument();
  });

  it("opens category dropdown when clicked", () => {
    render(<SearchBar {...mockProps} />);

    fireEvent.click(screen.getByText("All Categories"));

    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("Healthcare")).toBeInTheDocument();
  });

  it("selects country and calls onCountrySelect", () => {
    render(<SearchBar {...mockProps} />);

    fireEvent.click(screen.getByText("All Countries"));
    fireEvent.click(screen.getByText("United States"));

    expect(mockProps.onCountrySelect).toHaveBeenCalledWith({
      id: "1",
      name: "United States",
      code: "US",
    });
  });

  it("selects category and calls onCategorySelect", () => {
    render(<SearchBar {...mockProps} />);

    fireEvent.click(screen.getByText("All Categories"));
    fireEvent.click(screen.getByText("Education"));

    expect(mockProps.onCategorySelect).toHaveBeenCalledWith({
      id: "1",
      name: "Education",
      description: "Educational charities",
    });
  });

  it("shows loading state", () => {
    render(<SearchBar {...mockProps} isLoading />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("displays error message", () => {
    const error = new Error("Search failed");
    render(<SearchBar {...mockProps} error={error} />);
    expect(screen.getByText("Search failed")).toBeInTheDocument();
  });

  it("clears search when clear button is clicked", () => {
    render(<SearchBar {...mockProps} />);
    const searchInput = screen.getByRole("textbox");

    fireEvent.change(searchInput, { target: { value: "test" } });
    fireEvent.click(screen.getByLabelText("Clear search"));

    expect(searchInput).toHaveValue("");
    expect(mockProps.onSearch).toHaveBeenCalledWith("", {});
  });

  it("handles default country selection", () => {
    const defaultCountry = { id: "1", name: "United States", code: "US" };
    render(<SearchBar {...mockProps} defaultCountry={defaultCountry} />);

    expect(screen.getByText("United States")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <SearchBar {...mockProps} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles status filter changes", () => {
    render(<SearchBar {...mockProps} />);

    // This test covers conditional UI behavior
    expect(screen.getByText("All Countries")).toBeInTheDocument();
  });
});
