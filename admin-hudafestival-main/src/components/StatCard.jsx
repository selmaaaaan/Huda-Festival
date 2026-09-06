import React from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' }) => {
  return (
    <div className="bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--color-text-heading)]">{value}</p>
        <p className="text-sm text-[var(--color-text-body)]">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
