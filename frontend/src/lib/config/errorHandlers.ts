import * as Sentry from '@sentry/react';
import { env } from './env';

/**
 * Setup global error handlers for unhandled promise rejections and errors
 */
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (env.isProduction) {
      Sentry.captureException(event.reason, {
        tags: {
          type: 'unhandled-rejection',
        },
      });
    }
  });

  // Handle global errors that aren't caught by error boundaries
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    if (env.isProduction) {
      Sentry.captureException(event.error, {
        tags: {
          type: 'global-error',
        },
      });
    }
  });
}
