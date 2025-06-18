import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // 基本スタイル
          'inline-flex items-center justify-center rounded-xl font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          
          // バリアント
          {
            // Primary (New Note button)
            'bg-accent text-foreground hover:bg-accent/80': variant === 'primary',
            
            // Secondary
            'bg-card border border-border text-foreground hover:bg-muted/50': variant === 'secondary',
            
            // Danger (Delete button)
            'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
            
            // Ghost
            'text-foreground hover:bg-muted/50': variant === 'ghost',
          },
          
          // サイズ
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps }; 