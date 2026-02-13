import { describe, it, expect, jest } from "@jest/globals";
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock Sentry
jest.mock("@sentry/react", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock heavy internal components to avoid pulling in full dependency trees
jest.mock("./routes", () => ({
  AppRoutes: () => <div data-testid="app-routes">Routes</div>,
}));

jest.mock("./components/layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

jest.mock("./components/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("./components/web3/ChainSelectionModal", () => ({
  ChainSelectionModal: () => null,
}));

jest.mock("./hooks/useOnboarding", () => ({
  useOnboarding: () => ({
    showChainSelection: false,
    completeOnboarding: jest.fn(),
  }),
}));

jest.mock("./hooks/useSafeAutoConnect", () => ({
  useSafeAutoConnect: jest.fn(),
}));

jest.mock("./utils/monitoring", () => ({
  MonitoringService: {
    getInstance: jest.fn(),
  },
}));

// Mock context providers to pass through children
jest.mock("./contexts/ToastContext", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("./contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("./contexts/Web3Context", () => ({
  Web3Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("./contexts/ChainContext", () => ({
  ChainProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("./contexts/MultiChainContext", () => ({
  MultiChainProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("./contexts/SettingsContext", () => ({
  SettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("./contexts/CurrencyContext", () => ({
  CurrencyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import App from "./App";

describe("App", () => {
  it("should render without crashing", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(getByTestId("layout")).toBeInTheDocument();
    expect(getByTestId("app-routes")).toBeInTheDocument();
  });
});
