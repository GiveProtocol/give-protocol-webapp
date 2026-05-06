import React from "react";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { render, screen, act } from "@testing-library/react";
import { ToastProvider, useToast } from "@/contexts/ToastContext.real";

describe("ToastContext", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function ShowToastButton({
    type,
    title,
    message,
  }: {
    type: "success" | "error" | "loading" | "info";
    title: string;
    message?: string;
  }): React.ReactElement {
    const { showToast } = useToast();
    return (
      <button type="button" onClick={() => showToast(type, title, message)}>
        show
      </button>
    );
  }

  function renderWithProvider(child: React.ReactElement) {
    return render(<ToastProvider>{child}</ToastProvider>);
  }

  it("renders no toasts initially", () => {
    renderWithProvider(<div>child</div>);
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("displays a toast when showToast is called", () => {
    renderWithProvider(
      <ShowToastButton
        type="success"
        title="Saved"
        message="Profile updated"
      />,
    );
    act(() => {
      screen.getByText("show").click();
    });
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Profile updated")).toBeInTheDocument();
  });

  it("auto-dismisses non-loading toasts after 5 seconds", () => {
    renderWithProvider(<ShowToastButton type="success" title="Saved" />);
    act(() => {
      screen.getByText("show").click();
    });
    expect(screen.getByText("Saved")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("does not auto-dismiss loading toasts", () => {
    renderWithProvider(<ShowToastButton type="loading" title="Working..." />);
    act(() => {
      screen.getByText("show").click();
    });
    expect(screen.getByText("Working...")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(screen.getByText("Working...")).toBeInTheDocument();
  });

  it("removes a toast when its dismiss button is clicked", () => {
    renderWithProvider(<ShowToastButton type="loading" title="Working..." />);
    act(() => {
      screen.getByText("show").click();
    });
    expect(screen.getByText("Working...")).toBeInTheDocument();

    act(() => {
      screen.getByLabelText("Dismiss notification").click();
    });
    expect(screen.queryByText("Working...")).not.toBeInTheDocument();
  });

  it("supports multiple stacked toasts", () => {
    function MultiTrigger(): React.ReactElement {
      const { showToast } = useToast();
      return (
        <>
          <button type="button" onClick={() => showToast("success", "First")}>
            first
          </button>
          <button type="button" onClick={() => showToast("error", "Second")}>
            second
          </button>
        </>
      );
    }

    renderWithProvider(<MultiTrigger />);
    act(() => {
      screen.getByText("first").click();
    });
    act(() => {
      screen.getByText("second").click();
    });
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("throws when useToast is called outside ToastProvider", () => {
    function Consumer(): React.ReactElement {
      useToast();
      return <span>unreachable</span>;
    }

    // Suppress the expected React error log so the test output stays clean.
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      expect(() => render(<Consumer />)).toThrow(
        /useToast must be used within ToastProvider/,
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
