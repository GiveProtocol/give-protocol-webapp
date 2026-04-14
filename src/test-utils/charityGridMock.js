// Mock for components/charity/CharityGrid
// Mapped via moduleNameMapper.
import React from "react";

export const CharityGrid = ({ searchTerm }) =>
  React.createElement(
    "div",
    { "data-testid": "charity-grid" },
    `Charity Grid: ${searchTerm ?? ""}`,
  );
