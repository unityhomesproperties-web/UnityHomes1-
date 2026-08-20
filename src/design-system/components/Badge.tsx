import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-[var(--radius-badge)] whitespace-nowrap transition-colors duration-300';
    
    const variants = {
      default: 'bg-[var(--color-bg)] text-[var(--color-text-primary)]',
      success: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
      warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
      error: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
      info: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
      outline: 'border border-[var(--color-border)] text-[var(--color-text-secondary)]',
    };

    const classes = [baseStyles, variants[variant], className].filter(Boolean).join(' ');

    return (
      <span ref={ref} className={classes} {...props}>
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
