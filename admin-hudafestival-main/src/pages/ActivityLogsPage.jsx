import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SearchInput from '../components/SearchInput';
import SelectFilter from '../components/SelectFilter';
import StatusBadge from '../components/StatusBadge';
import { Activity } from 'lucide-react';

const ACTION_OPTIONS = [
  'LOGIN','CANDIDATE_CREATED','CANDIDATE_DELETED','PROGRAMME_CREATED','PROGRAMME_DELETED',
  'REGISTRATION_SUBMITTED','REGISTRATION_APPROVED','REGISTRATION_REJECTED',
  'RESULT_SAVED','RESULT_PUBLISHED','RESULT_BULK_PUBLISHED'
].map(a => ({ value: a, label: a.replace(/_/g, ' ') }));

const ENTITY_OPTIONS = ['Candidate','Programme','Registration','Result','User'].map(e => ({ value: e, label: e }));

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', entityType: '', from: '', to: '' });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) });
      const { data } = await api.get(`/audit-logs?${params}`);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, filters]);

  const setFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1); };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
          <Activity size={18} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-heading)]">Activity Logs</h1>
          <p className="text-xs text-[var(--color-text-muted)]">{total} total entries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SelectFilter value={filters.action} onChange={v => setFilter('action', v)} options={ACTION_OPTIONS} placeholder="All Actions" />
        <SelectFilter value={filters.entityType} onChange={v => setFilter('entityType', v)} options={ENTITY_OPTIONS} placeholder="All Entities" />
        <input type="date" value={filters.from} onChange={e => setFilter('from', e.target.value)}
          className="px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]" />
        <input type="date" value={filters.to} onChange={e => setFilter('to', e.target.value)}
          className="px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]" />
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-elevated)]">
            <tr>
              {['Timestamp','Actor','Role','Action','Entity','Details'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No log entries found.</td></tr>
            ) : logs.map(log => (
              <tr key={log._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{log.actor?.userName || 'System'}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)]">{log.actorRole}</span></td>
                <td className="px-4 py-3"><code className="text-xs text-[var(--color-primary)]">{log.action}</code></td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{log.entityType}</td>
                <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] max-w-xs truncate">{JSON.stringify(log.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        {total > 50 && (
          <div className="px-4 py-3 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">Showing {(page-1)*50+1}–{Math.min(page*50,total)} of {total}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 text-xs rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p+1)} disabled={page*50>=total} className="px-3 py-1 text-xs rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
