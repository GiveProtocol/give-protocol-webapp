import { render, screen, fireEvent } from "@testing-library/react";
import { jest } from "@jest/globals";
import { Toast, ToastType } from "../Toast";

describe("Toast", () => {
  it("renders title and message", () => {
    render(
      <Toast
        type="success"
        title="Saved"
        message="Your changes were saved"
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Your changes were saved")).toBeInTheDocument();
  });

  it("renders without a message", () => {
    render(<Toast type="success" title="Done" onClose={jest.fn()} />);

    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("calls onClose when dismiss button is clicked", () => {
    const onClose = jest.fn();
    render(<Toast type="error" title="Oops" onClose={onClose} />);

    fireEvent.click(screen.getByLabelText("Dismiss notification"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("uses alert role and assertive live region for errors", () => {
    render(<Toast type="error" title="Failed" onClose={jest.fn()} />);

    const region = screen.getByRole("alert");
    expect(region).toHaveAttribute("aria-live", "assertive");
  });

  it.each<ToastType>(["success", "error", "loading", "info"])(
    "renders an icon for type %s",
    (type) => {
      const { container } = render(
        <Toast type={type} title="Title" onClose={jest.fn()} />,
      );

      // Each variant maps to a lucide-react icon (svg) plus the close button's X svg.
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    },
  );

  it("applies the spinner animation only for loading", () => {
    const { container, rerender } = render(
      <Toast type="loading" title="Loading" onClose={jest.fn()} />,
    );
    expect(container.querySelector(".animate-spin")).not.toBeNull();

    rerender(<Toast type="info" title="Info" onClose={jest.fn()} />);
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});
