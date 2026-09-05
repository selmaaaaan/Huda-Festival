import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ activePage }) => {
  const pageLabel = activePage
    ? activePage.charAt(0).toUpperCase() + activePage.slice(1)
    : 'Dashboard';

  return (
    <nav className="flex items-center gap-2 text-sm text-[var(--color-text-body)]">
      <Home size={14} />
      <ChevronRight size={14} />
      <span className="font-medium text-[var(--color-text-heading)]">{pageLabel}</span>
    </nav>
  );
};

export default Breadcrumbs;
