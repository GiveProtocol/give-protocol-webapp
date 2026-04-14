// Mock for @/components/ui/ScrollReveal
// Mapped via moduleNameMapper — passes through children without animation.
import React from "react";

export const ScrollReveal = ({ children, className }) =>
  React.createElement("div", { className }, children);
