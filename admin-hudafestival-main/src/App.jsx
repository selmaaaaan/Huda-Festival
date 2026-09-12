import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CandidatePage from './pages/CandidatesPage';
import ProgrammesPage from './pages/ProgrammesPage';
import ResultsPage from './pages/ResultsPage';
import TeamRegistrationListPage from './pages/TeamRegistrationListPage';
import PendingResultsPage from './pages/PendingResultPage';
import PointAdjustmentPage from './pages/PointAdjustmentPage';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import SettingsPage from './pages/SettingsPage';
import SchedulePage from './pages/SchedulePage';
import VolunteerPortal from './pages/VolunteerPortal';
import { Search, Bell, AlertTriangle } from 'lucide-react';
import api from './services/api';

import JudgePanel from './pages/JudgePanel';
import JudgmentFeedbackPage from './pages/JudgmentFeedbackPage';
import TeamLeaderDashboard from './pages/TeamLeaderDashboard';
import TeamTopicRegistrationPage from './pages/TeamTopicRegistrationPage';
import RegistrationReviewPage from './pages/RegistrationReviewPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import GalleryPage from './pages/GalleryPage';
import NotificationsPage from './pages/NotificationsPage';
import TopicManagementPage from './pages/TopicManagementPage';
import TeamPortalDashboard from './pages/TeamPortalDashboard';

const Preloader = () => {
  const text = "HUDA FESTIVAL".split('');
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-surface)]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="flex font-bold text-2xl md:text-4xl tracking-widest overflow-hidden text-[var(--color-primary)]">
        {text.map((letter, i) => (
          <motion.span key={i}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="inline-block"
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

function App() {
  const savedInfo = localStorage.getItem('userInfo');
  const initialInfo = savedInfo ? JSON.parse(savedInfo) : null;
  
  const getInitialPage = (info) => {
    if (!info) return 'dashboard';
    if (info.role === 'judge') return 'judge_panel';
    if (info.role === 'team_leader') return 'team_dashboard';
    if (info.role === 'volunteer') return 'volunteer_portal';
    return 'dashboard';
  };

  const [isAuthenticated, setIsAuthenticated] = useState(!!initialInfo);
  const [userInfo, setUserInfo] = useState(initialInfo);
  const [activePage, setActivePage] = useState(getInitialPage(initialInfo));
  const [appSettings, setAppSettings] = useState({ maintenanceMode: false, maintenanceMessage: '' });
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowPreloader(false), 2000);
    return () => clearTimeout(t);
  }, []);

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
    setShowPreloader(true);
    setTimeout(() => setShowPreloader(false), 2000);
    
    setIsAuthenticated(true);
    const saved = localStorage.getItem('userInfo');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserInfo(parsed);
      setActivePage(getInitialPage(parsed));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setIsAuthenticated(false);
  };

  const renderPage = () => {
    let pageContent = null;
    let pageKey = activePage;

    switch (activePage) {
      case 'judge_panel':
        pageContent = <JudgePanel />;
        break;
      case 'team_dashboard':
        pageContent = <TeamPortalDashboard />;
        break;
      case 'team_programme_registration':
        pageContent = <TeamLeaderDashboard />;
        break;
      case 'team_registration_list':
        pageContent = <TeamRegistrationListPage />;
        break;
      case 'team_topic_registration':
        pageContent = <TeamTopicRegistrationPage />;
        break;
      case 'gallery':
        pageContent = <GalleryPage />;
        break;
      case 'notifications':
        pageContent = <NotificationsPage />;
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
      case 'judgment_feedback':
        pageContent = <JudgmentFeedbackPage />;
        break;
      case 'logs':
        pageContent = <ActivityLogsPage />;
        break;
      case 'topic_management':
        pageContent = <TopicManagementPage />;
        break;
      case 'schedule':
        pageContent = <SchedulePage />;
        break;
      case 'volunteer_portal':
        pageContent = <VolunteerPortal />;
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
    return (
      <>
        <AnimatePresence>{showPreloader && <Preloader />}</AnimatePresence>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  const initial = userInfo?.userName?.charAt(0)?.toUpperCase() || 'A';
  const roleName = userInfo?.role?.replace('_', ' ') || 'Admin';

  return (
    <>
      <AnimatePresence>{showPreloader && <Preloader />}</AnimatePresence>
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
    </>
  );
}

export default App;