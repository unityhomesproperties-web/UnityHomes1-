import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils'; // wait, I don't know if utils.ts exists, let's create a local cn

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Using explicit token values mapped to Tailwind classes via theme where applicable, or arbitrary values
    const variants = {
      primary: 'bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] hover:bg-[var(--color-emerald)] focus:ring-[var(--theme-brand-bg)]',
      secondary: 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-fresh)] focus:ring-[var(--color-brand)]',
      outline: 'border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] focus:ring-[var(--color-border)]',
      ghost: 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] focus:ring-[var(--color-bg)]',
      text: 'text-[var(--theme-brand-text)] hover:text-[var(--color-emerald)] p-0 hover:bg-transparent focus:ring-0',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-[var(--radius-button)]',
      md: 'h-12 px-6 text-base rounded-[var(--radius-button)]', // Target is 48px min touch target
      lg: 'h-14 px-8 text-lg rounded-[var(--radius-button)]',
      icon: 'h-12 w-12 rounded-[var(--radius-button)]',
    };

    const classes = [
      baseStyles,
      variants[variant],
      variant !== 'text' ? sizes[size] : '',
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';
