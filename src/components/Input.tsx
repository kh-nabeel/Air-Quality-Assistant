import { type InputHTMLAttributes, forwardRef } from 'react';

/** Props for the {@link Input} component. */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Accessible label (required) */
  readonly label: string;
  /** Visually hide the label while keeping it accessible */
  readonly hideLabel?: boolean;
  /** Error message to display */
  readonly error?: string;
  /** Hint text below the input */
  readonly hint?: string;
}

/** Component-scoped style definitions. */
const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  } satisfies React.CSSProperties,

  srOnlyLabel: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border: 0,
  } satisfies React.CSSProperties,

  visibleLabel: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 'var(--weight-medium)' as unknown as number,
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    textTransform: 'lowercase' as const,
  } satisfies React.CSSProperties,

  hint: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  } satisfies React.CSSProperties,

  error: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-error)',
  } satisfies React.CSSProperties,
} as const;

/**
 * Returns the base input field style, with error-state border colouring.
 *
 * @param hasError - Whether the input is in an error state.
 * @param extraStyle - Optional consumer-supplied style overrides.
 * @returns Merged CSS properties for the input element.
 */
function getInputStyle(hasError: boolean, extraStyle?: React.CSSProperties): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-base)',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    border: `2px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
    background: 'var(--color-bg-elevated)',
    color: 'var(--color-text-primary)',
    minHeight: '44px',
    width: '100%',
    transition: 'border-color var(--transition-fast)',
    outline: 'none',
    boxSizing: 'border-box',
    ...extraStyle,
  };
}

/**
 * Design-system text input with accessible label, error display, and 44 px touch target.
 *
 * @param props - Input component props including label and optional error/hint.
 * @param ref - Forwarded ref to the underlying `<input>` element.
 * @returns The rendered input field with label, hint, and error messaging.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hideLabel = false, error, hint, id, style, ...rest },
  ref,
) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div style={styles.wrapper}>
      <label htmlFor={inputId} style={hideLabel ? styles.srOnlyLabel : styles.visibleLabel}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        style={getInputStyle(!!error, style)}
        {...rest}
      />
      {hint && !error && (
        <span id={hintId} style={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" style={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
});
