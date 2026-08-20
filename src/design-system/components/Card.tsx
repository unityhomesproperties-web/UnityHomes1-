import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'selectable';
  selected?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', selected = false, children, ...props }, ref) => {
    
    const baseStyles = 'bg-[var(--color-surface-card)] rounded-[var(--radius-card)] border transition-all duration-300 ease-out';
    
    const variants = {
      default: 'border-[var(--color-border)] shadow-[var(--shadow-card)]',
      hover: 'border-[var(--color-border)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-dropdown)] hover:-translate-y-1',
      selectable: selected 
        ? 'border-[var(--theme-brand-bg)] shadow-[var(--shadow-dropdown)] ring-1 ring-[var(--theme-brand-bg)]' 
        : 'border-[var(--color-border)] shadow-[var(--shadow-card)] hover:border-[var(--theme-brand-bg)] cursor-pointer',
    };

    const classes = [baseStyles, variants[variant], className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`p-6 flex flex-col space-y-1.5 ${className}`} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h3 ref={ref} className={`font-semibold text-xl leading-none tracking-tight text-[var(--color-text-primary)] ${className}`} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => (
    <p ref={ref} className={`text-sm text-[var(--color-text-secondary)] ${className}`} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 flex items-center ${className}`} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
