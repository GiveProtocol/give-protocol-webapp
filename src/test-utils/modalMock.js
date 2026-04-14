// Mock for @/components/ui/Modal
// Mapped via moduleNameMapper — renders children when isOpen is true.
import React from "react";

export const Modal = ({ isOpen, children, title, onClose }) => {
  if (!isOpen) return null;
  return React.createElement(
    "div",
    { "data-testid": "modal" },
    title ? React.createElement("h2", null, title) : null,
    children,
    React.createElement("button", { onClick: onClose }, "Close Modal"),
  );
};
