import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { NewsUpdate } from "@/data/newsUpdates";
import { NewsUpdatesCard } from "./NewsUpdatesCard";

const SAMPLE_ITEMS: NewsUpdate[] = [
  {
    id: "n1",
    title: "First Update",
    excerpt: "Description of first update.",
    url: "/news/first",
    publishedAt: "2026-03-15",
  },
  {
    id: "n2",
    title: "Second Update",
    excerpt: "Description of second update.",
    url: "/news/second",
    publishedAt: "2026-03-10",
  },
  {
    id: "n3",
    title: "Third Update",
    excerpt: "Description of third update.",
    url: "/news/third",
    publishedAt: "2026-03-05",
  },
];

describe("NewsUpdatesCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Platform News heading", () => {
    render(
      <MemoryRouter>
        <NewsUpdatesCard items={SAMPLE_ITEMS} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Platform News")).toBeInTheDocument();
  });

  it("renders all provided items", () => {
    render(
      <MemoryRouter>
        <NewsUpdatesCard items={SAMPLE_ITEMS} />
      </MemoryRouter>,
    );
    expect(screen.getByText("First Update")).toBeInTheDocument();
    expect(screen.getByText("Second Update")).toBeInTheDocument();
    expect(screen.getByText("Third Update")).toBeInTheDocument();
  });

  it("renders item excerpts", () => {
    render(
      <MemoryRouter>
        <NewsUpdatesCard items={SAMPLE_ITEMS} />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Description of first update."),
    ).toBeInTheDocument();
  });

  it("limits the number of visible items via the limit prop", () => {
    render(
      <MemoryRouter>
        <NewsUpdatesCard items={SAMPLE_ITEMS} limit={2} />
      </MemoryRouter>,
    );
    expect(screen.getByText("First Update")).toBeInTheDocument();
    expect(screen.getByText("Second Update")).toBeInTheDocument();
    expect(screen.queryByText("Third Update")).not.toBeInTheDocument();
  });

  it("renders links pointing to the item url", () => {
    render(
      <MemoryRouter>
        <NewsUpdatesCard items={SAMPLE_ITEMS} limit={1} />
      </MemoryRouter>,
    );
    const link = screen.getByText("First Update").closest("a");
    expect(link).toHaveAttribute("href", "/news/first");
  });

  it("formats valid ISO date strings", () => {
    render(
      <MemoryRouter>
        <NewsUpdatesCard
          items={[
            {
              id: "d1",
              title: "Date Test",
              excerpt: "Testing date format.",
              url: "/news/date",
              publishedAt: "2026-01-15",
            },
          ]}
        />
      </MemoryRouter>,
    );
    // The exact formatted string depends on locale but should not be the raw ISO string
    expect(screen.queryByText("2026-01-15")).not.toBeInTheDocument();
  });

  it("renders Invalid Date text for an unparseable date string", () => {
    render(
      <MemoryRouter>
        <NewsUpdatesCard
          items={[
            {
              id: "d2",
              title: "Bad Date",
              excerpt: "Invalid date.",
              url: "/news/bad",
              publishedAt: "not-a-date",
            },
          ]}
        />
      </MemoryRouter>,
    );
    // toLocaleDateString returns "Invalid Date" for unparseable input
    expect(screen.getByText("Invalid Date")).toBeInTheDocument();
  });
});
