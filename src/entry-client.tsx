import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './i18n';
import { initSentry } from './lib/sentry';

// Initialize Sentry before rendering
initSentry();

// Hydrate the app
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

hydrateRoot(
  container,
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
