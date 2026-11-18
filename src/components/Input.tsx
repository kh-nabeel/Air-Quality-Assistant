import { type InputHTMLAttributes, forwardRef } from 'react';

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

/**
 * Design-system text input with accessible label, error display, and 44px touch target.
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <label
        htmlFor={inputId}
        style={
          hideLabel
            ? {
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0,0,0,0)',
                whiteSpace: 'nowrap',
                border: 0,
              }
            : {
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--weight-medium)' as unknown as number,
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                textTransform: 'lowercase' as const,
              }
        }
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          border: `2px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          background: 'var(--color-bg-elevated)',
          color: 'var(--color-text-primary)',
          minHeight: '44px',
          width: '100%',
          transition: 'border-color var(--transition-fast)',
          outline: 'none',
          boxSizing: 'border-box',
          ...style,
        }}
        {...rest}
      />
      {hint && !error && (
        <span id={hintId} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
          {error}
        </span>
      )}
    </div>
  );
});
