/* import { StrictMode } from 'react'; */
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from './lib/query';
import { initializeSentry } from './lib/config/sentry';
import { setupGlobalErrorHandlers } from './lib/config/errorHandlers';
import { GlobalErrorBoundary } from './shared/components';
import App from './App.tsx';
import './index.css';

// Initialize Sentry and error handlers before rendering
initializeSentry();
setupGlobalErrorHandlers();

createRoot(document.getElementById('root')!).render(
  <GlobalErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  </GlobalErrorBoundary>
);
