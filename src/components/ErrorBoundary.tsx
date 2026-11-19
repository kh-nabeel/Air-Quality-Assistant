import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Banner } from './Banner';
import { Button } from './Button';

/** Props for the {@link ErrorBoundary} component. */
interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

/** Internal state for the {@link ErrorBoundary} component. */
interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

/** Component-scoped style definitions. */
const styles = {
  container: {
    padding: 'var(--space-8)',
    maxWidth: 'var(--max-width-narrow)',
    margin: '0 auto',
  } satisfies React.CSSProperties,

  errorTitle: {
    margin: 0,
    fontWeight: 600,
  } satisfies React.CSSProperties,

  errorMessage: {
    margin: 'var(--space-2) 0 0',
    fontSize: 'var(--text-sm)',
  } satisfies React.CSSProperties,

  retryWrapper: {
    marginTop: 'var(--space-4)',
  } satisfies React.CSSProperties,
} as const;

/**
 * React error boundary that catches render errors and displays a friendly
 * error message with a retry button, or a custom fallback if provided.
 */
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
        <div style={styles.container}>
          <Banner variant="error">
            <p style={styles.errorTitle}>Something went wrong</p>
            <p style={styles.errorMessage}>
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
          </Banner>
          <div style={styles.retryWrapper}>
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
