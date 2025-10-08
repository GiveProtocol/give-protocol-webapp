import React from 'react';
import { jest } from '@jest/globals';

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ScheduledDonations } from "../ScheduledDonations";
import { useScheduledDonation } from "@/hooks/web3/useScheduledDonation";
import { useToast } from "@/contexts/ToastContext";
import { formatDate } from "@/utils/date";

// Mock the dependencies
jest.mock("@/hooks/web3/useScheduledDonation");
jest.mock("@/contexts/ToastContext");
jest.mock("@/utils/date", () => ({
  formatDate: jest.fn((date: string) => new Date(date).toLocaleDateString()),
}));
jest.mock("@/utils/logger", () => ({
  Logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));
jest.mock("@/components/ui/Card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));
jest.mock("@/components/ui/Button", () => ({
  Button: ({
    children,
    onClick,
    variant,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe("ScheduledDonations", () => {
  const mockGetDonorSchedules = jest.fn();
  const mockCancelSchedule = jest.fn();
  const mockShowToast = jest.fn();

  const mockSchedules = [
    {
      id: 1,
      charity: "0x1234567890123456789012345678901234567890",
      token: "USDC",
      totalAmount: "1000",
      amountPerMonth: "100",
      monthsRemaining: 10,
      nextDistribution: new Date("2024-02-01"),
      active: true,
    },
    {
      id: 2,
      charity: "0x9876543210987654321098765432109876543210",
      token: "DAI",
      totalAmount: "500",
      amountPerMonth: "50",
      monthsRemaining: 10,
      nextDistribution: new Date("2024-02-15"),
      active: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useScheduledDonation as jest.Mock).mockReturnValue({
      getDonorSchedules: mockGetDonorSchedules,
      cancelSchedule: mockCancelSchedule,
      loading: false,
      error: null,
    });

    (useToast as jest.Mock).mockReturnValue({
      showToast: mockShowToast,
    });

    (formatDate as jest.Mock).mockImplementation((date: string) =>
      new Date(date).toLocaleDateString(),
    );

    mockGetDonorSchedules.mockResolvedValue(mockSchedules);
  });

  describe("component rendering", () => {
    it("renders the component title", async () => {
      render(<ScheduledDonations />);

      await waitFor(() => {
        expect(
          screen.getByText("Monthly Donation Schedules"),
        ).toBeInTheDocument();
      });
    });

    it("shows loading spinner initially", () => {
      render(<ScheduledDonations />);
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("fetches and displays scheduled donations", async () => {
      render(<ScheduledDonations />);

      await waitFor(() => {
        expect(mockGetDonorSchedules).toHaveBeenCalled();
      });
    });
  });

  describe("scheduled donations list", () => {
    it("displays scheduled donation information", async () => {
      render(<ScheduledDonations />);

      await waitFor(() => {
        // Check that donation information is displayed
        expect(screen.getByText("USDC")).toBeInTheDocument();
        expect(screen.getByText("DAI")).toBeInTheDocument();
      });
    });

    it("shows active status correctly", async () => {
      render(<ScheduledDonations />);

      await waitFor(() => {
        // The component should display active/inactive status
        const cards = screen.getAllByTestId("card");
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it("displays correct donation amounts", async () => {
      render(<ScheduledDonations />);

      await waitFor(() => {
        expect(
          screen.getByText("Monthly Payment: 100 tokens"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Monthly Payment: 50 tokens"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("cancel functionality", () => {
    it("opens cancel modal when cancel button is clicked", async () => {
      render(<ScheduledDonations />);

      await waitFor(() => {
        expect(screen.getByText("USDC")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("Cancel Schedule");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText("Confirm Cancellation")).toBeInTheDocument();
        expect(screen.getByText("Keep Schedule")).toBeInTheDocument();
      });
    });

    it("calls cancelSchedule when confirming cancellation", async () => {
      mockCancelSchedule.mockResolvedValue(true);

      render(<ScheduledDonations />);

      await waitFor(() => {
        expect(screen.getByText("USDC")).toBeInTheDocument();
      });

      // Click cancel button
      fireEvent.click(screen.getByText("Cancel Schedule"));

      await waitFor(() => {
        expect(screen.getByText("Confirm Cancellation")).toBeInTheDocument();
      });

      // Click confirm in modal
      fireEvent.click(screen.getByText("Cancel Schedule"));

      await waitFor(() => {
        expect(mockCancelSchedule).toHaveBeenCalledWith(1);
        expect(mockShowToast).toHaveBeenCalledWith(
          "success",
          "Scheduled donation cancelled",
          expect.stringContaining(
            "Your monthly donation schedule has been cancelled",
          ),
        );
      });
    });
  });

  describe("error handling", () => {
    it("handles fetch error gracefully", async () => {
      mockGetDonorSchedules.mockRejectedValue(new Error("Fetch failed"));

      render(<ScheduledDonations />);

      await waitFor(() => {
        expect(mockGetDonorSchedules).toHaveBeenCalled();
      });
    });

    it("handles cancel error gracefully", async () => {
      mockCancelSchedule.mockRejectedValue(new Error("Cancel failed"));

      render(<ScheduledDonations />);

      await waitFor(() => {
        expect(screen.getByText("USDC")).toBeInTheDocument();
      });

      // Open modal and attempt cancel
      fireEvent.click(screen.getByText("Cancel Schedule"));

      await waitFor(() => {
        expect(screen.getByText("Confirm Cancellation")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cancel Schedule"));

      await waitFor(() => {
        expect(screen.getByText("Cancel failed")).toBeInTheDocument();
      });
    });
  });

  describe("loading states", () => {
    it("shows loading state when fetching schedules", () => {
      (useScheduledDonation as jest.Mock).mockReturnValue({
        getDonorSchedules: mockGetDonorSchedules,
        cancelSchedule: mockCancelSchedule,
        loading: true,
        error: null,
      });

      render(<ScheduledDonations />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("hides loading state after data loads", async () => {
      render(<ScheduledDonations />);

      await waitFor(() => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      });
    });
  });

  describe("empty state", () => {
    it("shows appropriate message when no schedules exist", async () => {
      mockGetDonorSchedules.mockResolvedValue([]);

      render(<ScheduledDonations />);

      await waitFor(() => {
        expect(screen.getByText("No Scheduled Donations")).toBeInTheDocument();
        expect(
          screen.getByText(
            "You don't have any active monthly donation schedules.",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe("error state", () => {
    it("displays error message when hook returns error", () => {
      (useScheduledDonation as jest.Mock).mockReturnValue({
        getDonorSchedules: mockGetDonorSchedules,
        cancelSchedule: mockCancelSchedule,
        loading: false,
        error: "Failed to connect to blockchain",
      });

      render(<ScheduledDonations />);

      expect(
        screen.getByText("Failed to connect to blockchain"),
      ).toBeInTheDocument();
    });
  });

  describe("date formatting", () => {
    it("formats next distribution dates correctly", async () => {
      render(<ScheduledDonations />);

      await waitFor(() => {
        expect(formatDate).toHaveBeenCalledWith("2024-02-01T00:00:00.000Z");
        expect(formatDate).toHaveBeenCalledWith("2024-02-15T00:00:00.000Z");
      });
    });
  });

  describe("modal interactions", () => {
    it("closes modal when Keep Schedule is clicked", async () => {
      render(<ScheduledDonations />);

      await waitFor(() => {
        expect(screen.getByText("USDC")).toBeInTheDocument();
      });

      // Open modal
      fireEvent.click(screen.getByText("Cancel Schedule"));

      await waitFor(() => {
        expect(screen.getByText("Confirm Cancellation")).toBeInTheDocument();
      });

      // Close modal
      fireEvent.click(screen.getByText("Keep Schedule"));

      await waitFor(() => {
        expect(
          screen.queryByText("Confirm Cancellation"),
        ).not.toBeInTheDocument();
      });
    });
  });
});
