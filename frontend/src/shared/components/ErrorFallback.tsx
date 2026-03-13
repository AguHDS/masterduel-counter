import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { env } from '../../lib/config/env';

interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
  showDetails?: boolean;
}

export function ErrorFallback({ error, resetError, showDetails = false }: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Something went wrong!
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Sorry, an unexpected error has occurred. Our team has been automatically notified.
        </p>

        {(showDetails && env.isDevelopment) && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Detalles del error (solo en desarrollo):</h3>
            <p className="text-sm text-red-600 font-mono mb-2">{error.message}</p>
            {error.stack && (
              <pre className="text-xs text-gray-600 overflow-auto max-h-40 p-2 bg-white rounded border">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleReload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Reload Page
          </button>

          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>

          {resetError && (
            <button
              onClick={resetError}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 text-center mt-8">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
