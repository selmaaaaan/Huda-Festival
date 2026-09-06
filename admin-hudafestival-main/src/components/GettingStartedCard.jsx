import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const GettingStartedCard = ({ counts }) => {
  const items = [
    { label: 'Teams added', done: (counts.teams || 0) > 0 },
    { label: 'Programmes added', done: (counts.programmes || 0) > 0 },
    { label: 'Candidates added', done: (counts.candidates || 0) > 0 },
    { label: 'Results published', done: (counts.published || 0) > 0 },
  ];

  const completed = items.filter(i => i.done).length;

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-heading)]">Getting Started</h3>
        <span className="text-sm text-[var(--color-text-body)]">{completed}/{items.length} completed</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
        <div
          className="h-2 rounded-full bg-[var(--color-primary)] transition-all duration-500"
          style={{ width: `${(completed / items.length) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {items.map(({ label, done }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {done ? (
                <CheckCircle size={18} className="text-green-500" />
              ) : (
                <Circle size={18} className="text-gray-300" />
              )}
              <span className={`text-sm ${done ? 'text-[var(--color-text-heading)]' : 'text-[var(--color-text-body)]'}`}>
                {label}
              </span>
            </div>
            {done ? (
              <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">Done</span>
            ) : (
              <span className="text-xs font-medium text-[var(--color-text-body)] bg-gray-100 px-2.5 py-1 rounded-full">Pending</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GettingStartedCard;
