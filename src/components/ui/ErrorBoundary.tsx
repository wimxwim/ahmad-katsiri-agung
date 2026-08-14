"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary] caught:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-glass border border-red-200 rounded-2xl p-6 sm:p-8 text-center shadow-glass"
        >
          <p className="font-heading font-bold text-lg text-on-surface mb-2">Terjadi kesalahan</p>
          <p className="text-sm text-on-surface-variant mb-1">
            {this.state.error?.message || "Terjadi kesalahan yang tidak terduga."}
          </p>
          <p className="text-xs text-on-surface-variant/60 mb-4">Coba muat ulang halaman atau kembali lagi.</p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
