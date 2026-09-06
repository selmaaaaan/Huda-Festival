import React, { useState } from 'react';
import { LayoutDashboard, Users, Calendar, Trophy, Clock, LogOut, Sliders, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import Logo from './Logo';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'candidates', label: 'Candidates', icon: Users },
  { key: 'programmes', label: 'Programmes', icon: Calendar },
  { key: 'registration_review', label: 'Registrations', icon: Clock },
  { key: 'results', label: 'Results', icon: Trophy },
  { key: 'pending results', label: 'Pending Results', icon: Clock },
  { key: 'adjustments', label: 'Point Adjustments', icon: Sliders },
  { key: 'logs', label: 'Activity Logs', icon: Activity },
];

const Sidebar = ({ activePage, setActivePage, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] transition-all duration-300`}>
      {/* Logo */}
      <div className="px-6 py-5 h-16 flex items-center justify-center overflow-hidden">
        {collapsed ? <Logo short /> : <Logo />}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-hidden">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = activePage === key;
          return (
            <button
              key={key}
              onClick={() => setActivePage(key)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-text-body)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-heading)]'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout & Collapse */}
      <div className="px-3 py-4 border-t border-[var(--color-border)] space-y-2">
        <button
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors duration-150`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center justify-center py-2.5 rounded-xl text-sm text-[var(--color-text-body)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-heading)] transition-colors`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
