import { jest } from "@jest/globals";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Replace the three view components and the skeleton with identifiable stubs so the
// test focuses purely on the auth-branching logic inside AppDashboard.
jest.mock("@/components/discovery/PublicDiscoveryView", () => ({
  PublicDiscoveryView: () => <div data-testid="public-view" />,
}));
jest.mock("@/components/discovery/DonorHubView", () => ({
  DonorHubView: () => <div data-testid="donor-view" />,
}));
jest.mock("@/components/discovery/CharityHubView", () => ({
  CharityHubView: () => <div data-testid="charity-view" />,
}));
jest.mock("@/components/discovery/DiscoveryShellSkeleton", () => ({
  DiscoveryShellSkeleton: () => <div data-testid="shell-skeleton" />,
}));

import AppDashboard from "./AppDashboard";

const mockUseAuth = jest.mocked(useAuth);

interface AuthOverrides {
  user?: unknown;
  userType?: "donor" | "charity" | "admin" | null;
  loading?: boolean;
}

function setAuth({ user = null, userType = null, loading = false }: AuthOverrides = {}) {
  mockUseAuth.mockReturnValue({
    user: user as never,
    userType,
    loading,
    error: null,
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
    resetPassword: jest.fn(),
    refreshSession: jest.fn(),
    register: jest.fn(),
    sendUsernameReminder: jest.fn(),
  } as never);
}

function renderWithRoutes(initialRoute = "/app") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/app" element={<AppDashboard />} />
        <Route path="/admin" element={<div data-testid="admin-page" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppDashboard auth branching", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("renders the skeleton while auth is loading", () => {
    setAuth({ loading: true });
    renderWithRoutes();
    expect(screen.getByTestId("shell-skeleton")).toBeInTheDocument();
  });

  it("renders the public view when there is no user", () => {
    setAuth({ user: null });
    renderWithRoutes();
    expect(screen.getByTestId("public-view")).toBeInTheDocument();
  });

  it("renders the donor view for a donor user", () => {
    setAuth({ user: { id: "u1" }, userType: "donor" });
    renderWithRoutes();
    expect(screen.getByTestId("donor-view")).toBeInTheDocument();
  });

  it("renders the charity view for a charity user", () => {
    setAuth({ user: { id: "u2" }, userType: "charity" });
    renderWithRoutes();
    expect(screen.getByTestId("charity-view")).toBeInTheDocument();
  });

  it("redirects admin users to /admin", () => {
    setAuth({ user: { id: "u3" }, userType: "admin" });
    renderWithRoutes();
    expect(screen.getByTestId("admin-page")).toBeInTheDocument();
    expect(screen.queryByTestId("donor-view")).not.toBeInTheDocument();
  });
});
