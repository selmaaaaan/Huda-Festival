import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CandidatePage from './pages/CandidatesPage';
import ProgrammesPage from './pages/ProgrammesPage';
import ResultsPage from './pages/ResultsPage';
import PendingResultsPage from './pages/PendingResultPage';
import PointAdjustmentPage from './pages/PointAdjustmentPage';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import SettingsPage from './pages/SettingsPage';
import { Search, Bell, AlertTriangle } from 'lucide-react';
import api from './services/api';

import TeamLeaderDashboard from './pages/TeamLeaderDashboard';
import RegistrationReviewPage from './pages/RegistrationReviewPage';
import ActivityLogsPage from './pages/ActivityLogsPage';

function App() {
  const savedInfo = localStorage.getItem('userInfo');
  const initialInfo = savedInfo ? JSON.parse(savedInfo) : null;
  
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialInfo);
  const [userInfo, setUserInfo] = useState(initialInfo);
  const [activePage, setActivePage] = useState(initialInfo?.role === 'team_leader' ? 'candidates' : 'dashboard');
  const [appSettings, setAppSettings] = useState({ maintenanceMode: false, maintenanceMessage: '' });

  useEffect(() => {
    // Poll settings every 30s
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data) setAppSettings({ maintenanceMode: data.maintenanceMode, maintenanceMessage: data.maintenanceMessage });
      } catch (e) {}
    };
    fetchSettings();
    const int = setInterval(fetchSettings, 30000);
    return () => clearInterval(int);
  }, []);

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
    let pageContent = null;
    let pageKey = activePage;

    switch (activePage) {
      case 'team_dashboard':
        pageContent = <TeamLeaderDashboard />;
        break;
      case 'settings':
        pageContent = <SettingsPage />;
        break;
      case 'candidates':
        pageContent = <CandidatePage />;
        break;
      case 'programmes':
        pageContent = <ProgrammesPage />;
        break;
      case 'registration_review':
        pageContent = <RegistrationReviewPage />;
        break;
      case 'results':
        pageContent = <ResultsPage />;
        break;
      case 'pending results':
        pageContent = <PendingResultsPage />;
        break;
      case 'adjustments':
        pageContent = <PointAdjustmentPage />;
        break;
      case 'logs':
        pageContent = <ActivityLogsPage />;
        break;
      case 'dashboard':
      default:
        pageContent = <DashboardPage />;
        break;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={pageKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {pageContent}
        </motion.div>
      </AnimatePresence>
    );
  };

  if (!isAuthenticated) {
    const isBypass = new URLSearchParams(window.location.search).get('bypass') === 'true';
    if (appSettings.maintenanceMode && !isBypass) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl relative z-10"
          >
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              We'll be right back.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-xl mx-auto leading-relaxed">
              {appSettings.maintenanceMessage || "The Huda Festival portal is currently undergoing scheduled maintenance. Please check back later."}
            </p>
          </motion.div>
        </div>
      );
    }
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const initial = userInfo?.userName?.charAt(0)?.toUpperCase() || 'A';
  const roleName = userInfo?.role?.replace('_', ' ') || 'Admin';

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)] text-[var(--color-text-heading)]">
      {appSettings.maintenanceMode && (
        <div className="bg-red-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 text-center shadow-md z-50">
          MAINTENANCE MODE ACTIVE - Public site is hidden
        </div>
      )}
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
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          onLogout={handleLogout}
          userInfo={userInfo}
        />
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;