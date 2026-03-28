import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[100vh] flex items-center justify-center p-8 bg-[var(--bg)] text-[var(--fg)]">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-amber-500/10">
                                <AlertTriangle className="w-12 h-12 text-amber-500" />
                            </div>
                        </div>
                        
                        <h1 className="text-2xl font-serif">Something went wrong</h1>
                        
                        <p className="opacity-60 text-sm">
                            The spirits are unsettled. Please try again.
                        </p>

                        {this.state.error && (
                            <details className="text-left text-xs opacity-40 p-4 bg-black/5 dark:bg-white/5 rounded">
                                <summary className="cursor-pointer">Error details</summary>
                                <pre className="mt-2 whitespace-pre-wrap">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--fg)] text-[var(--bg)] rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            
                            <Link
                                to="/"
                                className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--fg)] rounded-full text-sm font-medium hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
