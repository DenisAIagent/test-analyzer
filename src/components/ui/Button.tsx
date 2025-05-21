import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'bg-primary text-white hover:bg-opacity-90';
        case 'secondary':
          return 'bg-card text-white hover:bg-opacity-80';
        case 'outline':
          return 'bg-transparent border border-primary text-primary hover:bg-primary hover:bg-opacity-10';
        case 'ghost':
          return 'bg-transparent text-primary hover:bg-primary hover:bg-opacity-10';
        case 'link':
          return 'bg-transparent text-primary underline-offset-4 hover:underline p-0';
        default:
          return 'bg-primary text-white hover:bg-opacity-90';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'text-xs px-3 py-1.5 rounded';
        case 'md':
          return 'text-sm px-4 py-2 rounded-md';
        case 'lg':
          return 'text-base px-6 py-3 rounded-lg';
        default:
          return 'text-sm px-4 py-2 rounded-md';
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          getVariantClasses(),
          getSizeClasses(),
          variant !== 'link' && 'shadow-sm',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
        <span className={cn('flex items-center', isLoading && 'opacity-0')}>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;