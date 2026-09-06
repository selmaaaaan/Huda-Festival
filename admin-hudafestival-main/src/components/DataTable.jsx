import React from 'react';
import EmptyState from './EmptyState';

const DataTable = ({ headers, data, renderRow, emptyState }) => {
  return (
    <div className="overflow-x-auto bg-transparent">
      <table className="min-w-full">
        <thead className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)]">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {data.length > 0 ? (
            data.map(renderRow)
          ) : (
            <tr>
              <td colSpan={headers.length}>
                {emptyState || <EmptyState />}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
