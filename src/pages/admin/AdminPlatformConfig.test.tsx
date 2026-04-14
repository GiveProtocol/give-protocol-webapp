import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAdminPlatformConfig } from "@/hooks/useAdminPlatformConfig";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";
import AdminPlatformConfig from "./AdminPlatformConfig";

// useAdminPlatformConfig, useAdminAuditLog, Card, LoadingSpinner, Modal, Button
// are mocked via moduleNameMapper

const mockUseAdminPlatformConfig = jest.mocked(useAdminPlatformConfig);
const mockUseAdminAuditLog = jest.mocked(useAdminAuditLog);

const mockConfig = {
  key: "min_donation_usd" as const,
  value: 1,
  updatedAt: "2024-01-01T00:00:00Z",
  updatedByAdminId: "admin-1",
  updatedByAdminName: "Admin User",
};

const mockAuditEntry = {
  id: "audit-1",
  adminUserId: "admin-user-id-123",
  actionType: "charity_status_change" as const,
  entityType: "charity" as const,
  entityId: "charity-1",
  oldValues: null,
  newValues: { status: "approved" },
  ipAddress: null,
  createdAt: "2024-01-01T00:00:00Z",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminPlatformConfig />
    </MemoryRouter>,
  );

describe("AdminPlatformConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminPlatformConfig.mockReturnValue({
      configs: [],
      loading: false,
      saving: false,
      auditLog: [],
      auditLoading: false,
      fetchConfig: jest.fn().mockResolvedValue([]),
      saveConfig: jest.fn().mockResolvedValue(true),
      fetchAuditLog: jest.fn().mockResolvedValue([]),
    });
    mockUseAdminAuditLog.mockReturnValue({
      entries: [],
      totalCount: 0,
      totalPages: 0,
      page: 1,
      limit: 50,
      loading: false,
      fetchAuditLog: jest.fn().mockResolvedValue({
        entries: [],
        totalCount: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      }),
    });
  });

  describe("Renders", () => {
    it("renders the page heading", () => {
      renderPage();
      expect(screen.getByText("System Settings")).toBeInTheDocument();
    });

    it("renders Platform Config tab", () => {
      renderPage();
      expect(screen.getByText("Platform Config")).toBeInTheDocument();
    });

    it("renders Audit Log tab", () => {
      renderPage();
      expect(screen.getByText("Audit Log")).toBeInTheDocument();
    });

    it("renders Token & Network Config tab", () => {
      renderPage();
      expect(
        screen.getByText("Token & Network Config"),
      ).toBeInTheDocument();
    });

    it("shows empty config message when no configs", () => {
      renderPage();
      expect(
        screen.getByText(/No platform configuration found/i),
      ).toBeInTheDocument();
    });
  });

  describe("Tab switching", () => {
    it("shows audit log content when Audit Log tab is clicked", () => {
      renderPage();
      fireEvent.click(screen.getByText("Audit Log"));
      expect(screen.getByText(/No audit log entries/i)).toBeInTheDocument();
    });

    it("switches to Token & Network Config tab", () => {
      renderPage();
      fireEvent.click(screen.getByText("Token & Network Config"));
      expect(
        screen.getByText(/Token & Network/i),
      ).toBeInTheDocument();
    });
  });

  describe("Config entries", () => {
    it("renders config key label when configs exist", () => {
      mockUseAdminPlatformConfig.mockReturnValue({
        configs: [mockConfig],
        loading: false,
        saving: false,
        auditLog: [],
        auditLoading: false,
        fetchConfig: jest.fn().mockResolvedValue([mockConfig]),
        saveConfig: jest.fn().mockResolvedValue(true),
        fetchAuditLog: jest.fn().mockResolvedValue([]),
      });
      renderPage();
      // configKeyLabel mock returns the key string itself
      expect(screen.getByText("min_donation_usd")).toBeInTheDocument();
    });
  });

  describe("Audit log", () => {
    it("renders audit log entry when entries exist", () => {
      mockUseAdminAuditLog.mockReturnValue({
        entries: [mockAuditEntry],
        totalCount: 1,
        totalPages: 1,
        page: 1,
        limit: 50,
        loading: false,
        fetchAuditLog: jest.fn().mockResolvedValue({
          entries: [mockAuditEntry],
          totalCount: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        }),
      });
      renderPage();
      fireEvent.click(screen.getByText("Audit Log"));
      expect(screen.getByText("admin-user-id-123")).toBeInTheDocument();
    });
  });
});
