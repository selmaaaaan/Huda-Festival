import React from 'react';

const map = {
  pending:  { label: 'Pending',  bg: 'var(--color-status-pending-bg)',  text: 'var(--color-status-pending)' },
  approved: { label: 'Approved', bg: 'var(--color-status-approved-bg)', text: 'var(--color-status-approved)' },
  rejected: { label: 'Rejected', bg: 'var(--color-status-rejected-bg)', text: 'var(--color-status-rejected)' },
  published:{ label: 'Published',bg: 'var(--color-status-published-bg)',text: 'var(--color-status-published)' },
};

export function StatusBadge({ status }) {
  const cfg = map[status?.toLowerCase()] || map.pending;
  return (
    <span
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize"
    >
      {cfg.label}
    </span>
  );
}

export default StatusBadge;
