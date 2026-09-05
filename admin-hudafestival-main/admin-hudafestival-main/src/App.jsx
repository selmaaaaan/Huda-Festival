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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [userInfo, setUserInfo] = useState({
    _id: "preview_user_123",
    userName: "admin_preview",
    role: "admin",
    token: "dummy_token"
  });

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
    switch (activePage) {
      case 'candidates':
        return <CandidatePage />;
      case 'programmes':
        return <ProgrammesPage />;
      case 'results':
        return <ResultsPage />;
      case 'pending results':
        return <PendingResultsPage />;
      case 'adjustments':
        return <PointAdjustmentPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const initial = userInfo?.userName?.charAt(0)?.toUpperCase() || 'A';

  return (
    <div className="flex flex-col h-screen">
      {/* Header Bar */}
      <div className="h-1.5 w-full bg-[var(--color-header-bar)]" />

      {/* Utility Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[var(--color-border)]">
        <Breadcrumbs activePage={activePage} />

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--color-admin-bg)] rounded-xl border border-[var(--color-border)] w-80">
          <Search size={16} className="text-[var(--color-text-body)]" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none flex-1 text-[var(--color-text-heading)] placeholder:text-[var(--color-text-body)]"
          />
        </div>

        {/* User */}
        <div className="flex items-center gap-4">
          <button className="text-[var(--color-text-body)] hover:text-[var(--color-text-heading)] transition-colors">
            <Bell size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-semibold">
            {initial}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto bg-[var(--color-admin-bg)]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;