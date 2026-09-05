import React from 'react';
import { LayoutDashboard, Users, Calendar, Trophy, Clock, LogOut, Sliders } from 'lucide-react';
import Logo from './Logo';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'candidates', label: 'Candidates', icon: Users },
  { key: 'programmes', label: 'Programmes', icon: Calendar },
  { key: 'results', label: 'Results', icon: Trophy },
  { key: 'pending results', label: 'Pending Results', icon: Clock },
  { key: 'adjustments', label: 'Point Adjustments', icon: Sliders },
];

const Sidebar = ({ activePage, setActivePage, onLogout }) => {
  return (
    <aside className="w-64 flex flex-col bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)]">
      {/* Logo */}
      <div className="px-6 py-5">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = activePage === key;
          return (
            <button
              key={key}
              onClick={() => setActivePage(key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-text-body)] hover:bg-white hover:text-[var(--color-text-heading)]'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[var(--color-border)]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-150"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
