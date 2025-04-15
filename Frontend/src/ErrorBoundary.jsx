/* eslint-disable react/prop-types */
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error) {
    // Update state to indicate an error has occurred
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service or console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className=" flex flex-col items-center justify-center gap-4 p-4 text-center min-h-screen bg-gray-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something Went Wrong</h2>
          <p className="text-gray-700 mb-4">
            An unexpected error occurred. Please try again or contact support if the issue persists.
          </p>
          <p className="text-gray-500 mb-4">Error: {this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="ml-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;