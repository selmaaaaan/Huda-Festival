import React from 'react';
import { Search, X } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search size={14} className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
