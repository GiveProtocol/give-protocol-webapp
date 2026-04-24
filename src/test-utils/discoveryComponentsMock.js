// Mocks for @/components/discovery/* view components
// Mapped via moduleNameMapper — allows AppDashboard tests to verify auth-branching logic
// without depending on the full discovery component tree.
import React from "react";

/** Mock PublicDiscoveryView component. */
export const PublicDiscoveryView = () =>
  React.createElement("div", { "data-testid": "public-view" });

/** Mock DonorHubView component. */
export const DonorHubView = () =>
  React.createElement("div", { "data-testid": "donor-view" });

/** Mock CharityHubView component. */
export const CharityHubView = () =>
  React.createElement("div", { "data-testid": "charity-view" });

/** Mock DiscoveryShellSkeleton component. */
export const DiscoveryShellSkeleton = () =>
  React.createElement("div", { "data-testid": "shell-skeleton" });
