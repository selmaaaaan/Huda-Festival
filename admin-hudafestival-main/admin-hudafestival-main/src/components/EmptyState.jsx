import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'No data found', description = 'There is nothing to display yet.' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-[var(--color-text-body)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-heading)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-body)]">{description}</p>
    </div>
  );
};

export default EmptyState;
