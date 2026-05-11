import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./i18n";
import { initSentry } from "./lib/sentry";

// Initialize Sentry before rendering
initSentry();

// Handle stale chunk errors after deployments: when Vite's preloader fails to
// fetch a dynamically imported module (e.g. hash mismatch after a new deploy),
// reload the page so the browser fetches fresh HTML with correct asset hashes.
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

// Create container
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
