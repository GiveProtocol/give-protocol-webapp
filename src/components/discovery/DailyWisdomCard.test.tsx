import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

// Mock useDailyWisdom before importing the component
jest.mock("@/hooks/useDailyWisdom", () => ({
  useDailyWisdom: jest.fn(() => ({
    id: "q01",
    text: "No one has ever become poor by giving.",
    attribution: "Anne Frank",
  })),
}));

import { DailyWisdomCard } from "./DailyWisdomCard";

describe("DailyWisdomCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Daily Wisdom heading", () => {
    render(<DailyWisdomCard />);
    expect(screen.getByText("Daily Wisdom")).toBeInTheDocument();
  });

  it("renders the quote text inside a blockquote", () => {
    render(<DailyWisdomCard />);
    const blockquote = screen.getByText(
      /No one has ever become poor by giving/,
    );
    expect(blockquote).toBeInTheDocument();
    expect(blockquote.tagName).toBe("BLOCKQUOTE");
  });

  it("renders the attribution", () => {
    render(<DailyWisdomCard />);
    expect(screen.getByText(/Anne Frank/)).toBeInTheDocument();
  });
});
