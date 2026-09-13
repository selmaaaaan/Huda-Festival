import React from 'react';

const DashboardHero = ({ userName, roleName, subtitle }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-[var(--color-surface-elevated)] dark:via-[var(--color-surface)] dark:to-[var(--color-surface-elevated)] p-8 mb-8 border border-[var(--color-border)] shadow-sm">
      {/* Decorative Mosque Silhouette */}
      <div className="absolute right-0 bottom-0 opacity-10 dark:opacity-5 pointer-events-none w-2/3 h-full overflow-hidden flex justify-end items-end">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full fill-current text-[var(--color-primary)] mix-blend-multiply dark:mix-blend-screen">
          <path d="M70,50 L70,30 Q70,25 65,25 Q60,25 60,30 L60,50 Z M80,50 L80,10 Q80,0 85,0 Q90,0 90,10 L90,50 Z M40,50 L40,20 Q40,10 45,10 Q50,10 50,20 L50,50 Z M10,50 L10,35 Q10,30 15,30 Q20,30 20,35 L20,50 Z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-full text-xs font-semibold text-[var(--color-primary)] border border-white/40 dark:border-white/10 mb-4 shadow-sm">
            ✨ <span className="capitalize">{roleName} Panel</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-heading)]">
            Welcome back, {userName} <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2 font-medium">
            {subtitle || "Here's what's happening with HUDA Festival today."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
