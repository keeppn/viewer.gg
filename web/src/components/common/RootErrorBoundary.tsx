"use client";

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Root Error Boundary wrapper for the entire app
 * Wraps all content to catch top-level errors
 */
export default function RootErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to external error tracking service if configured
        // e.g., Sentry, LogRocket, etc.
        console.error('[RootErrorBoundary] Application error:', {
          error: error.toString(),
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
