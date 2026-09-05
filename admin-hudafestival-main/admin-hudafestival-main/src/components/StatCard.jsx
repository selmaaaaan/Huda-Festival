import React from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'bg-blue-50 text-blue-600' }) => {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 flex items-center gap-4">
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
