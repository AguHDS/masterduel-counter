/**
 * TEST COMPONENT - Error Boundary Testing
 * 
 * Este componente sirve para probar el sistema de Error Boundaries.
 * NO incluir en producción.
 * 
 * Uso:
 * 1. Importar en cualquier página
 * 2. Hacer clic en los botones para simular diferentes tipos de errores
 * 3. Verificar que Sentry captura los errores (en producción)
 * 4. Verificar que los Error Boundaries funcionan correctamente
 */

import { useState } from 'react';

export function ErrorBoundaryTestComponent() {
  const [count, setCount] = useState(0);

  // Test 1: Synchronous render error
  if (count === 1) {
    throw new Error('🔴 Test: Synchronous Render Error');
  }

  // Test 2: Async error (not caught by Error Boundary, but by global handlers)
  const testAsyncError = () => {
    setTimeout(() => {
      throw new Error('🟠 Test: Async Error (setTimeout)');
    }, 100);
  };

  // Test 3: Unhandled promise rejection
  const testPromiseRejection = () => {
    Promise.reject(new Error('🟡 Test: Unhandled Promise Rejection'));
  };

  // Test 4: Event handler error (requires try-catch or global handler)
  const testEventHandlerError = () => {
    throw new Error('🟢 Test: Event Handler Error');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-4 border-2 border-red-500 z-50 max-w-sm">
      <div className="mb-3 text-center">
        <h3 className="font-bold text-red-600 mb-1">⚠️ Error Boundary Tester</h3>
        <p className="text-xs text-gray-600">Solo para desarrollo</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setCount(1)}
          className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          🔴 Render Error (caught by boundary)
        </button>

        <button
          onClick={testAsyncError}
          className="w-full px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
        >
          🟠 Async Error (global handler)
        </button>

        <button
          onClick={testPromiseRejection}
          className="w-full px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
        >
          🟡 Promise Rejection (global handler)
        </button>

        <button
          onClick={() => {
            try {
              testEventHandlerError();
            } catch (error) {
              console.error('Caught event handler error:', error);
              // En producción, esto iría a Sentry
            }
          }}
          className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          🟢 Event Handler (try-catch)
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Revisa la consola y Sentry
        </p>
      </div>
    </div>
  );
}
