import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', variant = 'danger', onConfirm, onCancel, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-6 w-full max-w-md shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors">
          <X size={18} />
        </button>
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-600/10">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-heading)]">{title}</h3>
            {message && <p className="text-sm text-[var(--color-text-body)] mt-1">{message}</p>}
          </div>
        </div>
        {children && <div className="mb-4">{children}</div>}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
