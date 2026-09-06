import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white border-transparent',
  secondary: 'bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] text-[var(--color-text-heading)] border-[var(--color-border)]',
  danger: 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-600/30',
  ghost: 'bg-transparent hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-body)] border-transparent hover:text-[var(--color-text-heading)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center gap-2 rounded-lg border font-medium transition-colors duration-150 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

export default Button;
