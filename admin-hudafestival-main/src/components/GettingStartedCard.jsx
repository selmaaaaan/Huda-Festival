import React from 'react';
import { motion } from 'framer-motion';

const GettingStartedCard = ({ progressData }) => {
  if (!progressData) return null;
  
  const items = [
    { label: 'Registration Status', pct: progressData.registration.percentage, completed: progressData.registration.completed, total: progressData.registration.total },
    { label: 'Topic Registration', pct: progressData.topic.percentage, completed: progressData.topic.completed, total: progressData.topic.total },
    { label: 'Fully Valuated', pct: progressData.valuated.percentage, completed: progressData.valuated.completed, total: progressData.valuated.total },
    { label: 'Result Published', pct: progressData.published.percentage, completed: progressData.published.completed, total: progressData.published.total }
  ];

  return (
    <motion.div 
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] p-6 hover:shadow-lg hover:shadow-black/5 flex flex-col h-full"
    >
      <h3 className="text-lg font-semibold text-[var(--color-text-heading)] mb-6">Festival Progress</h3>

      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-[var(--color-text-heading)]">{item.label}</span>
              <span className="text-[var(--color-text-muted)]">{item.pct}% ({item.completed}/{item.total})</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-1000"
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default GettingStartedCard;
