import React, { ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 font-sans">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-2">Application Error</h2>
            <p className="text-gray-600 mb-4">The application failed to render.</p>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-40 text-gray-800">
              {this.state.error?.message}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    
    return (this as any).props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}