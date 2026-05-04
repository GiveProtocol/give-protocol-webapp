import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ValidationResponseModal } from "./ValidationResponseModal";

// Mock RejectionReasonSelect
jest.mock("./RejectionReasonSelect", () => ({
  RejectionReasonSelect: ({
    value,
    onReasonChange,
    onNotesChange,
    error,
  }: {
    value: string;
    notes: string;
    onReasonChange: (_reason: string) => void;
    onNotesChange: (_notes: string) => void;
    error: string;
  }) => (
    <div data-testid="rejection-reason-select">
      <select
        data-testid="reason-select"
        value={value}
        onChange={(e) => onReasonChange(e.target.value)}
      >
        <option value="">Select reason</option>
        <option value="insufficient_evidence">Insufficient Evidence</option>
      </select>
      <input
        data-testid="notes-input"
        onChange={(e) => onNotesChange(e.target.value)}
      />
      {error && <span data-testid="error-msg">{error}</span>}
    </div>
  ),
}));

// Mock types
jest.mock("@/types/selfReportedHours", () => ({
  ACTIVITY_TYPE_LABELS: {
    community_service: "Community Service",
    tutoring: "Tutoring",
  },
}));

describe("ValidationResponseModal", () => {
  const mockItem = {
    id: "req-123",
    volunteerName: "Jane Smith",
    volunteerEmail: "jane@example.com",
    activityDate: "2024-03-15",
    hours: 4,
    activityType: "community_service",
    description: "Helped organize community event",
    location: "Downtown Center",
    createdAt: "2024-03-16T10:00:00Z",
    daysRemaining: 5,
    isResubmission: false,
  };

  const defaultProps = {
    item: mockItem,
    isOpen: true,
    onClose: jest.fn(),
    onApprove: jest.fn().mockResolvedValue(true),
    onReject: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when not open", () => {
    const { container } = render(
      <ValidationResponseModal {...defaultProps} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders volunteer info", () => {
    render(<ValidationResponseModal {...defaultProps} />);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("renders activity details", () => {
    render(<ValidationResponseModal {...defaultProps} />);
    expect(screen.getByText("4 hours")).toBeInTheDocument();
    expect(screen.getByText("Community Service")).toBeInTheDocument();
    expect(screen.getByText("Downtown Center")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<ValidationResponseModal {...defaultProps} />);
    expect(
      screen.getByText("Helped organize community event"),
    ).toBeInTheDocument();
  });

  it("shows days remaining", () => {
    render(<ValidationResponseModal {...defaultProps} />);
    expect(
      screen.getByText(/5 days remaining to validate/),
    ).toBeInTheDocument();
  });

  it("shows resubmission notice when applicable", () => {
    render(
      <ValidationResponseModal
        {...defaultProps}
        item={{ ...mockItem, isResubmission: true }}
      />,
    );
    expect(screen.getByText(/appeal\/resubmission/)).toBeInTheDocument();
  });

  it("calls onApprove when Approve button is clicked", async () => {
    render(<ValidationResponseModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() => {
      expect(defaultProps.onApprove).toHaveBeenCalledWith("req-123");
    });
  });

  it("switches to reject mode when Reject button is clicked", () => {
    render(<ValidationResponseModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Reject"));
    expect(screen.getByText("Reject Validation Request")).toBeInTheDocument();
    expect(screen.getByTestId("rejection-reason-select")).toBeInTheDocument();
  });

  it("goes back from reject mode when Back button is clicked", () => {
    render(<ValidationResponseModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Reject"));
    fireEvent.click(screen.getByText("Back"));
    expect(screen.getByText("Review Validation Request")).toBeInTheDocument();
  });

  it("calls onClose when overlay is clicked", () => {
    render(<ValidationResponseModal {...defaultProps} />);
    const overlay = screen.getByRole("dialog").parentElement;
    expect(overlay).toBeTruthy();
    fireEvent.click(overlay!);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    render(<ValidationResponseModal {...defaultProps} />);
    const overlay = screen.getByRole("dialog").parentElement;
    expect(overlay).toBeTruthy();
    fireEvent.keyDown(overlay!, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
