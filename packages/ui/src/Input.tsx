import React from 'react';
import { cn } from './Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          className={cn(
            'w-full px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-surface)] border rounded-[var(--radius-md)]',
            'border-[var(--color-border)] placeholder:text-[var(--color-text-muted)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:border-transparent',
            'disabled:opacity-50 disabled:bg-[var(--color-surface-muted)]',
            error && 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]',
            className
          )}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="text-xs text-[var(--color-danger)] font-medium">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${inputId}-help`} className="text-xs text-[var(--color-text-muted)]">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
