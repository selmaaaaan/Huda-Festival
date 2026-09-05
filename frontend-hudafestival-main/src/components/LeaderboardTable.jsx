import React from 'react';

const LeaderboardTable = ({ title, headers, data, renderRow }) => {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
      <div className="bg-[var(--color-primary)] px-6 py-4">
        <h3 className="text-xl font-bold text-white text-center">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-body)]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <React.Fragment key={index}>{renderRow(item, index)}</React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <p className="font-semibold text-[var(--color-text-heading)]">No data available yet</p>
                    <p className="text-sm text-[var(--color-text-body)]">Check back later for updates</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-[var(--color-border)]">
        <div className="flex justify-between items-center text-xs text-[var(--color-text-body)]">
          <span>Total entries: {data?.length || 0}</span>
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export { LeaderboardTable };
export default LeaderboardTable;