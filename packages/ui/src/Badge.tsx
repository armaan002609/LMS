import React from 'react';
import { cn } from './Button';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
    success: 'bg-emerald-50 text-[var(--color-success)] border border-emerald-200',
    warning: 'bg-amber-50 text-[var(--color-warning)] border border-amber-200',
    danger: 'bg-red-50 text-[var(--color-danger)] border border-red-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
