import React from "react";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SelfReportedHoursForm } from "../SelfReportedHoursForm";
import type { SelfReportedHoursInput } from "@/types/selfReportedHours";
import {
  ActivityType,
  ACTIVITY_TYPE_LABELS,
  MIN_DESCRIPTION_LENGTH,
} from "@/types/selfReportedHours";

// useCharityOrganizationSearch is mocked via moduleNameMapper (ESM-compatible)
import { useCharityOrganizationSearch } from "@/hooks/useCharityOrganizationSearch";

const mockUseCharityOrgSearch = jest.mocked(useCharityOrganizationSearch);

const mockOnSubmit = jest.fn<(_input: SelfReportedHoursInput) => Promise<void>>();
const mockOnCancel = jest.fn();

const VALID_DESCRIPTION = "A".repeat(MIN_DESCRIPTION_LENGTH);

const renderForm = (props: Partial<Parameters<typeof SelfReportedHoursForm>[0]> = {}) =>
  render(
    <MemoryRouter>
      <SelfReportedHoursForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        {...props}
      />
    </MemoryRouter>,
  );

/** Submits the form by dispatching a submit event on the form element. */
const submitForm = (container: HTMLElement) => {
  const form = container.querySelector("form");
  if (form) {
    fireEvent.submit(form);
  }
};

describe("SelfReportedHoursForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
    mockUseCharityOrgSearch.mockReturnValue({
      organizations: [],
      loading: false,
      hasMore: false,
      error: null,
      loadMore: jest.fn(),
    });
  });

  describe("Rendering", () => {
    it("renders the date field", () => {
      renderForm();
      expect(screen.getByLabelText(/^date/i)).toBeInTheDocument();
    });

    it("renders the hours field", () => {
      renderForm();
      expect(screen.getByLabelText(/^hours/i)).toBeInTheDocument();
    });

    it("renders the location field", () => {
      renderForm();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    });

    it("renders the activity type dropdown with default label", () => {
      renderForm();
      expect(
        screen.getByText(ACTIVITY_TYPE_LABELS[ActivityType.DIRECT_SERVICE]),
      ).toBeInTheDocument();
    });

    it("renders the description textarea", () => {
      renderForm();
      expect(
        screen.getByPlaceholderText(/describe the activities/i),
      ).toBeInTheDocument();
    });

    it("renders the organization legend", () => {
      renderForm();
      expect(screen.getByText("Organization")).toBeInTheDocument();
    });

    it("renders the cancel button", () => {
      renderForm();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("renders the submit button with 'Log Hours' text", () => {
      renderForm();
      expect(screen.getByText("Log Hours")).toBeInTheDocument();
    });

    it("renders the submit button with 'Update Hours' text in edit mode", () => {
      renderForm({ isEdit: true });
      expect(screen.getByText("Update Hours")).toBeInTheDocument();
    });
  });

  describe("Activity type dropdown", () => {
    it("opens dropdown when activity type button is clicked", () => {
      const { container } = renderForm();
      const button = container.querySelector("#activityTypeButton");
      expect(button).not.toBeNull();
      fireEvent.click(button as HTMLElement);
      // All activity types should be visible in the dropdown
      expect(
        screen.getByText(ACTIVITY_TYPE_LABELS[ActivityType.FUNDRAISING]),
      ).toBeInTheDocument();
    });

    it("selects a new activity type from the dropdown", () => {
      const { container } = renderForm();
      const button = container.querySelector("#activityTypeButton");
      fireEvent.click(button as HTMLElement);

      // Click Fundraising option -- use getAllByText since label appears both in
      // the trigger text and the dropdown list; pick the dropdown list item.
      const fundraisingOptions = screen.getAllByText(
        ACTIVITY_TYPE_LABELS[ActivityType.FUNDRAISING],
      );
      fireEvent.click(fundraisingOptions[fundraisingOptions.length - 1]);

      // The dropdown button should now show the new selection
      expect(
        screen.getByText(ACTIVITY_TYPE_LABELS[ActivityType.FUNDRAISING]),
      ).toBeInTheDocument();
    });
  });

  describe("Organization mode toggle", () => {
    it("defaults to 'Not Listed' mode (other)", () => {
      renderForm();
      expect(screen.getByText("Not Listed")).toBeInTheDocument();
    });

    it("shows organization name input in 'Not Listed' mode", () => {
      renderForm();
      expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
    });

    it("switches to registry search mode", () => {
      renderForm();
      const registryRadio = screen.getByLabelText(/search registry/i);
      fireEvent.click(registryRadio);
      expect(
        screen.getByPlaceholderText(/search charity registry/i),
      ).toBeInTheDocument();
    });
  });

  describe("Validation errors on empty submit", () => {
    it("shows date error when date is empty", async () => {
      const { container } = renderForm();
      act(() => {
        submitForm(container);
      });

      await waitFor(() => {
        expect(screen.getByText("Activity date is required")).toBeInTheDocument();
      });
    });

    it("shows description error when description is empty", async () => {
      const { container } = renderForm();
      act(() => {
        submitForm(container);
      });

      await waitFor(() => {
        expect(
          screen.getByText(new RegExp("Description must be at least")),
        ).toBeInTheDocument();
      });
    });

    it("shows organization name error when name is empty in other mode", async () => {
      const { container } = renderForm();
      act(() => {
        submitForm(container);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Organization name is required"),
        ).toBeInTheDocument();
      });
    });

    it("does not call onSubmit when form is invalid", async () => {
      const { container } = renderForm();
      act(() => {
        submitForm(container);
      });

      await waitFor(() => {
        expect(screen.getByText("Activity date is required")).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Successful submission", () => {
    it("calls onSubmit with form data when valid", async () => {
      const { container } = renderForm();

      // Fill in date
      const dateInput = screen.getByLabelText(/^date/i);
      fireEvent.change(dateInput, { target: { name: "activityDate", value: "2025-01-15" } });

      // Fill in hours
      const hoursInput = screen.getByLabelText(/^hours/i);
      fireEvent.change(hoursInput, { target: { name: "hours", value: "4" } });

      // Fill in description
      const descriptionInput = screen.getByPlaceholderText(
        /describe the activities/i,
      );
      fireEvent.change(descriptionInput, {
        target: { name: "description", value: VALID_DESCRIPTION },
      });

      // Fill in organization name (other mode is default)
      const orgNameInput = screen.getByLabelText(/organization name/i);
      fireEvent.change(orgNameInput, {
        target: { name: "organizationName", value: "Test Organization" },
      });

      // Submit
      act(() => {
        submitForm(container);
      });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.activityDate).toBe("2025-01-15");
      expect(submittedData.hours).toBe(4);
      expect(submittedData.description).toBe(VALID_DESCRIPTION);
      expect(submittedData.organizationName).toBe("Test Organization");
    });
  });

  describe("Cancel button", () => {
    it("calls onCancel when cancel button is clicked", () => {
      renderForm();
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("disables cancel button when submitting", () => {
      renderForm({ isLoading: true });
      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toBeDisabled();
    });
  });

  describe("Initial data", () => {
    it("pre-fills form fields from initialData", () => {
      renderForm({
        initialData: {
          activityDate: "2025-03-10",
          hours: 6,
          description: VALID_DESCRIPTION,
          location: "Remote",
        },
      });

      const dateInput = screen.getByLabelText(/^date/i) as HTMLInputElement;
      expect(dateInput.value).toBe("2025-03-10");

      const hoursInput = screen.getByLabelText(/^hours/i) as HTMLInputElement;
      expect(hoursInput.value).toBe("6");

      const locationInput = screen.getByLabelText(/location/i) as HTMLInputElement;
      expect(locationInput.value).toBe("Remote");
    });
  });

  describe("Validation status preview", () => {
    it("shows unvalidated preview when in other mode", () => {
      renderForm();
      expect(
        screen.getByText(/saved as unvalidated/i),
      ).toBeInTheDocument();
    });
  });

  describe("Loading state", () => {
    it("shows loading text when isLoading is true", () => {
      renderForm({ isLoading: true });
      expect(screen.getByText("Logging...")).toBeInTheDocument();
    });

    it("shows 'Updating...' text when isLoading and isEdit are true", () => {
      renderForm({ isLoading: true, isEdit: true });
      expect(screen.getByText("Updating...")).toBeInTheDocument();
    });
  });
});
