import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CandidatePage from './pages/CandidatesPage';
import ProgrammesPage from './pages/ProgrammesPage';
import ResultsPage from './pages/ResultsPage';
import PendingResultsPage from './pages/PendingResultPage';
import PointAdjustmentPage from './pages/PointAdjustmentPage';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import { Search, Bell } from 'lucide-react';

import TeamLeaderDashboard from './pages/TeamLeaderDashboard';
import RegistrationReviewPage from './pages/RegistrationReviewPage';
import ActivityLogsPage from './pages/ActivityLogsPage';

function App() {
  const savedInfo = localStorage.getItem('userInfo');
  const initialInfo = savedInfo ? JSON.parse(savedInfo) : null;
  
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialInfo);
  const [userInfo, setUserInfo] = useState(initialInfo);
  const [activePage, setActivePage] = useState('dashboard');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const saved = localStorage.getItem('userInfo');
    if (saved) setUserInfo(JSON.parse(saved));
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setIsAuthenticated(false);
  };

  const renderPage = () => {
    if (userInfo?.role === 'team_leader') {
      return <TeamLeaderDashboard />;
    }

    switch (activePage) {
      case 'candidates':
        return <CandidatePage />;
      case 'programmes':
        return <ProgrammesPage />;
      case 'registration_review':
        return <RegistrationReviewPage />;
      case 'results':
        return <ResultsPage />;
      case 'pending results':
        return <PendingResultsPage />;
      case 'adjustments':
        return <PointAdjustmentPage />;
      case 'logs':
        return <ActivityLogsPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const initial = userInfo?.userName?.charAt(0)?.toUpperCase() || 'A';
  const roleName = userInfo?.role?.replace('_', ' ') || 'Admin';

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)] text-[var(--color-text-heading)]">
      {/* Utility Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        {userInfo?.role === 'team_leader' ? (
          <div className="text-sm font-medium text-[var(--color-text-heading)]">Team Portal</div>
        ) : (
          <Breadcrumbs activePage={activePage} />
        )}

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] w-80">
          <Search size={16} className="text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none flex-1 text-[var(--color-text-heading)] placeholder:text-[var(--color-text-muted)]"
          />
        </div>

        {/* User */}
        <div className="flex items-center gap-4">
          <button className="text-[var(--color-text-body)] hover:text-[var(--color-text-heading)] transition-colors">
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogout} title="Logout">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium leading-none">{userInfo?.userName || 'User'}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1 capitalize">{roleName}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {userInfo?.role !== 'team_leader' && (
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            onLogout={handleLogout}
          />
        )}
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;