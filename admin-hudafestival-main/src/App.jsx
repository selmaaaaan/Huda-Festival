import { useEffect, useState } from 'react';
import GlobalSearch from './components/GlobalSearch';
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
import { Search, Bell, AlertTriangle, LogOut, Sun, Moon } from 'lucide-react';
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('huda-admin-primary-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        document.documentElement.style.setProperty('--color-primary', theme.hex);
        document.documentElement.style.setProperty('--color-primary-hover', theme.hover);
      } catch (e) {
        console.error('Failed to parse saved theme');
      }
    }
    const savedMode = localStorage.getItem('huda-admin-theme');
    if (savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('huda-admin-theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('huda-admin-theme', 'dark');
      setIsDark(true);
    }
  };
  const [showPreloader, setShowPreloader] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeNotifications, setActiveNotifications] = useState([]);

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

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifications = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const isAdmin = userInfo?.role === 'admin';
        const { data } = await api.get(isAdmin ? '/notifications/all' : '/notifications');
        if (Array.isArray(data)) {
          setActiveNotifications(data);
          const readIds = JSON.parse(localStorage.getItem('huda_read_notifications') || '[]');
          const unread = data.filter(n => !readIds.includes(n._id)).length;
          setUnreadNotifications(unread);
        }
      } catch (e) {}
    };
    fetchNotifications();
    const int = setInterval(fetchNotifications, 60000);
    return () => clearInterval(int);
  }, [isAuthenticated, activePage]);

  const handleNotificationClick = () => {
    if (activeNotifications.length > 0) {
      const readIds = JSON.parse(localStorage.getItem('huda_read_notifications') || '[]');
      const newReadIds = [...new Set([...readIds, ...activeNotifications.map(n => n._id)])];
      localStorage.setItem('huda_read_notifications', JSON.stringify(newReadIds));
      setUnreadNotifications(0);
    }
    setActivePage('notifications');
  };

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

    const role = userInfo?.role;
    const isAdmin = role === 'admin';
    const isTeamLeader = role === 'team_leader';
    const isJudge = role === 'judge';
    const isVolunteer = role === 'volunteer';

    // Route Guards
    if (activePage === 'judge_panel' && !isJudge && !isAdmin) return <div className="p-8 text-red-500">Unauthorized</div>;
    if (activePage === 'volunteer_portal' && !isVolunteer && !isAdmin) return <div className="p-8 text-red-500">Unauthorized</div>;
    if (activePage.startsWith('team_') && !isTeamLeader && !isAdmin) return <div className="p-8 text-red-500">Unauthorized</div>;
    if (activePage === 'candidates' && !isTeamLeader && !isAdmin) return <div className="p-8 text-red-500">Unauthorized</div>;
    if (!['judge_panel', 'volunteer_portal', 'settings', 'notifications', 'candidates'].includes(activePage) && !activePage.startsWith('team_') && !isAdmin) return <div className="p-8 text-red-500">Unauthorized</div>;

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
      <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text-heading)]">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          onLogout={handleLogout}
          userInfo={userInfo}
        />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {appSettings.maintenanceMode && (
            <div className="bg-red-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 text-center shadow-md z-50">
              MAINTENANCE MODE ACTIVE - Public site is hidden
            </div>
          )}
          
          {/* Utility Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            
            {/* Left Side: Search */}
            <div className="flex-1 flex items-center gap-4">
              <GlobalSearch onNavigate={(type) => { if (type === 'teams') setActivePage('dashboard'); else setActivePage(type); }} />
            </div>

            {/* Right Side: Theme, Notifications, Logout */}
            <div className="flex items-center gap-5">
              <button onClick={toggleTheme} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors cursor-pointer" title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button className="relative text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors cursor-pointer" title="Notifications" onClick={handleNotificationClick}>
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[var(--color-surface)]">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white px-5 py-2 rounded-full transition-all font-semibold text-sm border border-red-500/20 hover:border-red-500 cursor-pointer"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}

export default App;