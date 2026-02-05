import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ActionButtons } from "../ActionButtons";

jest.mock("@/hooks/useTranslation", () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string, fallback?: string) => fallback || key),
  })),
}));

jest.mock("react-router-dom", () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid="link">
      {children}
    </a>
  ),
}));

describe("ActionButtons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders successfully", () => {
    const { container } = render(<ActionButtons />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders the "Start Donating" text', () => {
    render(<ActionButtons />);
    expect(screen.getByText("Start Donating")).toBeInTheDocument();
  });

  it("renders a link pointing to /browse", () => {
    render(<ActionButtons />);
    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("href", "/browse");
  });
});
