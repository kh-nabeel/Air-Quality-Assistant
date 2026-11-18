import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Banner } from './Banner';
import { Button } from './Button';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

/** Catches React render errors and displays a friendly error message */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Saans] Uncaught error:', error, info.componentStack);
  }

  private readonly handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            padding: 'var(--space-8)',
            maxWidth: 'var(--max-width-narrow)',
            margin: '0 auto',
          }}
        >
          <Banner variant="error">
            <p style={{ margin: 0, fontWeight: 600 }}>Something went wrong</p>
            <p style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--text-sm)' }}>
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
          </Banner>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Button variant="secondary" onClick={this.handleRetry}>
              try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
