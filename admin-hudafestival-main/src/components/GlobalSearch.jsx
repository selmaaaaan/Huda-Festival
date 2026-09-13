import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import api from '../services/api';

const GlobalSearch = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ candidates: [], programmes: [], teams: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ candidates: [], programmes: [], teams: [] });
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/search?q=' + encodeURIComponent(query));
        setResults(data);
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-96 hidden md:flex" ref={searchRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
      <input
        type="text"
        placeholder="Search candidates, programmes, teams..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        className="w-full pl-10 pr-10 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
      />
      {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-text-muted)]" size={16} />}

      {isOpen && query.length >= 2 && (results.candidates.length > 0 || results.programmes.length > 0 || results.teams.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl shadow-lg max-h-96 overflow-y-auto z-50 p-2">
          {results.candidates.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-2">Candidates</div>
              {results.candidates.map(c => (
                <div key={c._id} className="px-3 py-2 hover:bg-[var(--color-surface)] rounded-lg cursor-pointer transition-colors"
                     onClick={() => { setIsOpen(false); setQuery(''); if(onNavigate) onNavigate('candidates', c); }}>
                  <div className="font-medium text-[var(--color-text-heading)]">{c.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{c.admissionNo} • {c.team?.name}</div>
                </div>
              ))}
            </div>
          )}
          {results.programmes.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-2">Programmes</div>
              {results.programmes.map(p => (
                <div key={p._id} className="px-3 py-2 hover:bg-[var(--color-surface)] rounded-lg cursor-pointer transition-colors"
                     onClick={() => { setIsOpen(false); setQuery(''); if(onNavigate) onNavigate('programmes', p); }}>
                  <div className="font-medium text-[var(--color-text-heading)]">{p.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{p.code} • {p.type}</div>
                </div>
              ))}
            </div>
          )}
          {results.teams.length > 0 && (
            <div className="mb-1">
              <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-2">Teams</div>
              {results.teams.map(t => (
                <div key={t._id} className="px-3 py-2 hover:bg-[var(--color-surface)] rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                     onClick={() => { setIsOpen(false); setQuery(''); if(onNavigate) onNavigate('teams', t); }}>
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: t.color || '#ccc'}}></div>
                  <div className="font-medium text-[var(--color-text-heading)]">{t.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {isOpen && query.length >= 2 && !loading && results.candidates.length === 0 && results.programmes.length === 0 && results.teams.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl shadow-lg p-4 text-center text-sm text-[var(--color-text-muted)] z-50">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
};
export default GlobalSearch;
