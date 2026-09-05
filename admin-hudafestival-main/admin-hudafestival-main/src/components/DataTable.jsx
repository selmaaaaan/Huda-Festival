import React from 'react';
import EmptyState from './EmptyState';

const DataTable = ({ headers, data, renderRow }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-[var(--color-border)]">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-body)]"
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
                <EmptyState />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
