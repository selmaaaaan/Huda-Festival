import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white border-transparent hover:shadow-md hover:shadow-[var(--color-primary)]/20',
  secondary: 'bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] text-[var(--color-text-heading)] border-[var(--color-border)]',
  danger: 'bg-red-600/10 hover:bg-red-600/20 text-red-500 border-red-600/30',
  ghost: 'bg-transparent hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-body)] border-transparent hover:text-[var(--color-text-heading)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', ...props }) {
  return (
    <motion.button
      {...props}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
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
    </motion.button>
  );
}

export default Button;
