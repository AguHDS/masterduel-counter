import * as Sentry from '@sentry/react';
import { env } from './env';

export function initializeSentry() {
  if (!env.SENTRY_DSN) {
    console.warn('⚠️ Sentry DSN not found. Error tracking is disabled.');
    return;
  }

  console.log('🔧 Initializing Sentry...');
  console.log('Environment (VITE_QUERY_ENV):', env.QUERY_ENV);
  console.log('Sentry enabled:', env.QUERY_ENV === 'production' || env.QUERY_ENV === 'development');

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.QUERY_ENV || 'unknown',
    enabled: env.QUERY_ENV === 'production' || env.QUERY_ENV === 'development',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: env.QUERY_ENV === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Send default PII data
    sendDefaultPii: true,
    beforeSend(event, hint) {
      // Log errors to console
      if (env.QUERY_ENV === 'development') {
        console.group('🐛 Sentry Event');
        console.log('Event:', event);
        console.log('Error:', hint.originalException);
        console.groupEnd();
      }
      return event;
    },
  });

  console.log('✅ Sentry initialized successfully!');
}
