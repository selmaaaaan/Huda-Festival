/**
 * ProgrammeCodePicker — THE single canonical programme selector.
 *
 * Props:
 *   programmes  — Array<Programme>  — required. Pass the full programme list.
 *   value       — programmeId (string) | null
 *   onSelect    — (programme | null) => void
 *                 Called with the full programme object on valid selection, or null on clear.
 *   disabled    — boolean (optional)
 *   compact     — boolean (optional) — hides the info strip when true (for tight layouts)
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, CheckCircle2 } from 'lucide-react';

export default function ProgrammeCodePicker({
  programmes = [],
  value = null,
  onSelect,
  disabled = false,
  compact = false,
}) {
  const selected = useMemo(
    () => programmes.find(p => p._id === value) || null,
    [programmes, value]
  );

  const [inputVal, setInputVal] = useState(selected?.code || '');
  const [open, setOpen]         = useState(false);
  const [query, setQuery]       = useState('');
  const containerRef            = useRef(null);
  const inputRef                = useRef(null);

  // Keep input text in sync when parent changes value
  useEffect(() => {
    setInputVal(selected?.code || '');
  }, [selected]);

  // Filter list by query (matches code OR name)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return programmes.slice().sort((a, b) => a.code.localeCompare(b.code));
    return programmes
      .filter(p =>
        p.code?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        // exact code matches float to top
        const aExact = a.code?.toLowerCase() === q;
        const bExact = b.code?.toLowerCase() === q;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.code.localeCompare(b.code);
      });
  }, [programmes, query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        // If user typed but didn't pick, restore to selected code (or blank)
        setInputVal(selected?.code || '');
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selected]);

  const pick = (prog) => {
    setInputVal(prog.code);
    setQuery('');
    setOpen(false);
    onSelect?.(prog);
  };

  const clear = (e) => {
    e.stopPropagation();
    setInputVal('');
    setQuery('');
    setOpen(false);
    onSelect?.(null);
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputVal(v);
    setQuery(v);
    setOpen(true);

    // Auto-select on exact code match (case-insensitive)
    const exact = programmes.find(p => p.code?.toLowerCase() === v.trim().toLowerCase());
    if (exact) pick(exact);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setInputVal(selected?.code || '');
      setQuery('');
    }
    if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault();
      pick(filtered[0]);
    }
  };

  const inputClasses = [
    'w-full pl-9 pr-8 py-2 text-sm rounded-lg border transition-colors',
    'bg-[var(--color-surface)] border-[var(--color-border)]',
    'text-[var(--color-text-heading)] placeholder-[var(--color-text-muted)]',
    'focus:outline-none focus:border-[var(--color-primary)]',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text',
    selected ? 'border-[var(--color-primary)]/60' : '',
  ].join(' ');

  return (
    <div ref={containerRef} className="space-y-3">
      {/* ── Input + dropdown ─────────────────────────────────────────────── */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]"
        />
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          disabled={disabled}
          placeholder="Type code or name…"
          value={inputVal}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={inputClasses}
        />
        {/* Clear / check icon */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {selected ? (
            <CheckCircle2 size={15} className="text-[var(--color-primary)]" />
          ) : inputVal ? (
            <button type="button" onClick={clear} className="text-[var(--color-text-muted)] hover:text-red-400">
              <X size={14} />
            </button>
          ) : null}
        </span>

        {/* ── Dropdown ───────────────────────────────────────────────────── */}
        {open && !disabled && (
          <ul className="absolute z-50 mt-1 left-0 right-0 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl text-sm">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-[var(--color-text-muted)] text-center">No programmes match</li>
            ) : filtered.map(p => (
              <li
                key={p._id}
                onMouseDown={() => pick(p)}   // mousedown fires before blur
                className={[
                  'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors',
                  p._id === value
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-heading)]',
                ].join(' ')}
              >
                <span className="font-mono text-xs font-bold shrink-0 w-16 text-[var(--color-primary)]">
                  {p.code}
                </span>
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-xs text-[var(--color-text-muted)] shrink-0">{p.category}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Programme info strip (shown when a programme is selected) ─────── */}
      {selected && !compact && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <InfoPill label="Name"     value={selected.name}     wide />
          <InfoPill label="Category" value={selected.category} />
          <InfoPill label="Stage"    value={selected.stageType === 'stage' ? 'Stage' : 'Non-Stage'} />
          <InfoPill label="Format"   value={selected.format || selected.type} />
          {selected.isStarred && <InfoPill label="Type" value="⭐ Starred" />}
        </div>
      )}
    </div>
  );
}

function InfoPill({ label, value, wide }) {
  return (
    <div className={`flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] ${wide ? 'col-span-2' : ''}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</span>
      <span className="font-semibold text-[var(--color-text-heading)] truncate">{value || '—'}</span>
    </div>
  );
}
