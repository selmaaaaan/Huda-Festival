import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const GettingStartedCard = ({ progressData, title = "Festival Progress" }) => {
  const [showCategories, setShowCategories] = useState(false);

  if (!progressData) return null;
  
  const items = [
    { label: 'Registration Status', pct: progressData.registration.percentage, completed: progressData.registration.completed, total: progressData.registration.total },
    { label: 'Topic Registration', pct: progressData.topic.percentage, completed: progressData.topic.completed, total: progressData.topic.total },
    { label: 'Fully Valuated', pct: progressData.valuated?.percentage || 0, completed: progressData.valuated?.completed || 0, total: progressData.valuated?.total || 0 },
    { label: 'Result Published', pct: progressData.published?.percentage || 0, completed: progressData.published?.completed || 0, total: progressData.published?.total || 0 }
  ];

  const categoriesData = progressData.categoryWise || progressData.categoryProgress || [];

  return (
    <motion.div 
      className="bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] p-6 hover:shadow-lg hover:shadow-black/5 flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-heading)]">{title}</h3>
          {categoriesData.length > 0 && (
              <button 
                onClick={() => setShowCategories(!showCategories)}
                className="text-xs flex items-center gap-1 text-[var(--color-primary)] font-medium bg-[var(--color-primary)]/10 px-2 py-1 rounded-md hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                {showCategories ? 'Hide Breakdown' : 'Category Breakdown'}
                {showCategories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
          )}
      </div>

      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-[var(--color-text-heading)]">{item.label}</span>
              <span className="text-[var(--color-text-muted)]">{item.pct}% ({Math.round(item.completed)}/{Math.round(item.total)})</span>
            </div>
            <div className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-1000"
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
          {showCategories && categoriesData.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-6 overflow-hidden"
              >
                  {categoriesData.map((cat, idx) => (
                      <div key={idx} className="space-y-3">
                          <h4 className="text-sm font-bold text-[var(--color-text-heading)]">{cat.category}</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <div className="flex justify-between text-xs mb-1">
                                      <span className="text-[var(--color-text-muted)]">Registrations</span>
                                      <span className="font-medium">{Math.round(cat.registration.completed)}/{Math.round(cat.registration.total)}</span>
                                  </div>
                                  <div className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-[var(--color-primary)] h-full rounded-full" style={{ width: `${cat.registration.percentage}%` }} />
                                  </div>
                              </div>
                              <div>
                                  <div className="flex justify-between text-xs mb-1">
                                      <span className="text-[var(--color-text-muted)]">Topics</span>
                                      <span className="font-medium">{Math.round(cat.topic.completed)}/{Math.round(cat.topic.total)}</span>
                                  </div>
                                  <div className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-purple-500 h-full rounded-full" style={{ width: `${cat.topic.percentage}%` }} />
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GettingStartedCard;
