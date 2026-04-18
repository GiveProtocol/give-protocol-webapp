import React from "react";
import { jest } from "@jest/globals";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminPlatformConfig from "../admin/AdminPlatformConfig";

// Hooks and services are mocked via moduleNameMapper

import { useAdminPlatformConfig } from "@/hooks/useAdminPlatformConfig";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";
import {
  configKeyLabel,
  configValueInputType,
} from "@/services/adminPlatformConfigService";
import { getAdminDashboardStats } from "@/services/adminDashboardService";
import { listAdminUsers } from "@/services/adminSettingsService";

const mockUseAdminPlatformConfig = jest.mocked(useAdminPlatformConfig);
const mockUseAdminAuditLog = jest.mocked(useAdminAuditLog);
const _mockConfigKeyLabel = jest.mocked(configKeyLabel);
const _mockConfigValueInputType = jest.mocked(configValueInputType);
const mockGetAdminDashboardStats = jest.mocked(getAdminDashboardStats);
const mockListAdminUsers = jest.mocked(listAdminUsers);

const mockFetchConfig = jest.fn<() => Promise<unknown>>().mockResolvedValue([]);
const mockSaveConfig = jest.fn<() => Promise<boolean>>().mockResolvedValue(true);
const mockFetchAuditLog = jest.fn<() => Promise<unknown>>().mockResolvedValue({
  entries: [],
  totalCount: 0,
  page: 1,
  limit: 50,
  totalPages: 0,
});

const mockConfigs = [
  {
    key: "min_donation_usd" as const,
    value: 5,
    description: null,
    updatedAt: "2025-01-01T00:00:00Z",
    updatedBy: "admin-1",
  },
  {
    key: "validation_window_days" as const,
    value: 30,
    description: null,
    updatedAt: "2025-01-01T00:00:00Z",
    updatedBy: "admin-1",
  },
];

const mockStats = {
  totalDonors: 100,
  totalCharities: 50,
  verifiedCharities: 30,
  pendingCharities: 20,
  totalVolunteers: 75,
  cryptoVolumeUsd: 10000,
  fiatVolumeUsd: 5000,
  totalVolumeUsd: 15000,
  trends: {
    registrations7d: 5,
    registrations30d: 20,
    donations7d: 1000,
    donations30d: 5000,
  },
};

const mockAdminUsers = [
  {
    userId: "admin-1",
    email: "admin@test.com",
    displayName: null,
    joinedAt: "2025-01-01T00:00:00Z",
  },
];

const renderComponent = () =>
  render(
    <MemoryRouter>
      <AdminPlatformConfig />
    </MemoryRouter>,
  );

describe("AdminPlatformConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAdminPlatformConfig.mockReturnValue({
      configs: mockConfigs,
      loading: false,
      saving: false,
      auditLog: [],
      auditLoading: false,
      fetchConfig: mockFetchConfig,
      saveConfig: mockSaveConfig,
      fetchAuditLog: jest.fn(),
    });

    mockUseAdminAuditLog.mockReturnValue({
      entries: [],
      totalCount: 0,
      totalPages: 0,
      page: 1,
      limit: 50,
      loading: false,
      fetchAuditLog: mockFetchAuditLog,
    });

    mockGetAdminDashboardStats.mockResolvedValue(mockStats);
    mockListAdminUsers.mockResolvedValue(mockAdminUsers);
  });

  describe("Loading state", () => {
    it("shows loading spinner when config is loading", () => {
      mockUseAdminPlatformConfig.mockReturnValue({
        configs: [],
        loading: true,
        saving: false,
        auditLog: [],
        auditLoading: false,
        fetchConfig: mockFetchConfig,
        saveConfig: mockSaveConfig,
        fetchAuditLog: jest.fn(),
      });
      renderComponent();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Title", () => {
    it("renders System Settings title", () => {
      renderComponent();
      expect(screen.getByText("System Settings")).toBeInTheDocument();
    });
  });

  describe("Platform Config tab", () => {
    it("shows Platform Config tab by default with config cards", () => {
      renderComponent();
      expect(screen.getByText("min_donation_usd")).toBeInTheDocument();
      expect(screen.getByText("validation_window_days")).toBeInTheDocument();
    });

    it("shows Edit button on config entries", () => {
      renderComponent();
      const editButtons = screen.getAllByText("Edit");
      expect(editButtons.length).toBeGreaterThanOrEqual(2);
    });

    it("shows empty state when no configs exist", () => {
      mockUseAdminPlatformConfig.mockReturnValue({
        configs: [],
        loading: false,
        saving: false,
        auditLog: [],
        auditLoading: false,
        fetchConfig: mockFetchConfig,
        saveConfig: mockSaveConfig,
        fetchAuditLog: jest.fn(),
      });
      renderComponent();
      expect(
        screen.getByText(
          "No platform configuration found. Ensure the platform_config table has been seeded.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Tab switching", () => {
    it("switches to Audit Log tab", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Audit Log"));
      expect(screen.getByText("Apply Filters")).toBeInTheDocument();
    });

    it("switches to Admin Users tab", async () => {
      renderComponent();
      fireEvent.click(screen.getByText("Admin Users"));
      await waitFor(() => {
        expect(
          screen.getByText(
            "Read-only directory of platform administrator accounts.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("switches to System Health tab and shows stats", async () => {
      renderComponent();
      fireEvent.click(screen.getByText("System Health"));
      await waitFor(() => {
        expect(screen.getByText("Service Status")).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText("Total Donors")).toBeInTheDocument();
      });
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  describe("Edit modal", () => {
    it("opens edit modal when Edit button is clicked", () => {
      renderComponent();
      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(
        screen.getByText("Edit: min_donation_usd"),
      ).toBeInTheDocument();
    });
  });
});
