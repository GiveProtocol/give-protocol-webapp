import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import { DailyWisdomCard } from "./DailyWisdomCard";

describe("DailyWisdomCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Daily Wisdom heading", () => {
    render(<DailyWisdomCard />);
    expect(screen.getByText("Daily Wisdom")).toBeInTheDocument();
  });

  it("renders a quote inside a blockquote", () => {
    render(<DailyWisdomCard />);
    const blockquote = document.querySelector("blockquote");
    expect(blockquote).toBeInTheDocument();
    expect(blockquote?.textContent).toBeTruthy();
  });

  it("renders the attribution", () => {
    render(<DailyWisdomCard />);
    expect(screen.getByText(/^—/u)).toBeInTheDocument();
  });
});
