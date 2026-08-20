import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-teal-950 text-teal-50 p-6 rounded-2xl shadow-xl border border-teal-800 text-center flex flex-col items-center justify-center space-y-4">
          <h2 className="text-lg font-black font-display uppercase tracking-widest text-teal-400">Something went wrong loading this section</h2>
          <p className="text-sm font-light">An error occurred while rendering the data.</p>
          <button
            className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold uppercase text-xs tracking-wider transition shadow-md"
            onClick={() => (this as any).setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
