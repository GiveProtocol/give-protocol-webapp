// Mocks for @/components/discovery/* view components
// Mapped via moduleNameMapper — allows AppDashboard tests to verify auth-branching logic
// without depending on the full discovery component tree.
import React from "react";

export const PublicDiscoveryView = () =>
  React.createElement("div", { "data-testid": "public-view" });

export const DonorHubView = () =>
  React.createElement("div", { "data-testid": "donor-view" });

export const CharityHubView = () =>
  React.createElement("div", { "data-testid": "charity-view" });

export const DiscoveryShellSkeleton = () =>
  React.createElement("div", { "data-testid": "shell-skeleton" });
