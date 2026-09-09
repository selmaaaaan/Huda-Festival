import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import ProgrammesPage from './pages/ProgrammeListPage';
import LeaderboardsPage from './pages/LeaderboardsPage';
import ResultsPage from './pages/ResultPage'
import SearchPage from './pages/CandidateSearchPage';
import CertificatePage from './pages/CertificateViewPage';

// 1. Import the necessary components from react-router-dom
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/layout/Footer';
import SchedulePage from './pages/SchedulePage';
import GalleryPage from './pages/GalleryPage';
import LoadingScreen from './components/ui/LoadingScreen';
import NotificationBanner from './components/ui/NotificationBanner';
import MaintenancePage from './components/ui/MaintenancePage';
import api from './services/api';
import PageTransition from './components/layout/PageTransition';

function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [appSettings, setAppSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setAppSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        setAppSettings({ maintenanceMode: false, maintenanceMessage: '' });
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const isMaintenance = appSettings?.maintenanceMode === true;

  return (
    <BrowserRouter>
      {!loadingComplete && (
        <LoadingScreen 
          isReady={!settingsLoading} 
          onComplete={() => setLoadingComplete(true)} 
        />
      )}
      
      {!settingsLoading && !isMaintenance && (
        <div className={`font-sans min-h-screen flex flex-col ${!loadingComplete ? 'hidden' : ''}`}>
          <Navbar />
          <NotificationBanner />
          <main className="flex-1 relative">
            <Routes>
              <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
              <Route path="/leaderboards" element={<PageTransition><LeaderboardsPage /></PageTransition>} />
              <Route path="/programmes" element={<PageTransition><ProgrammesPage /></PageTransition>} />
              <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
              <Route path="/programmes/:programmeId/results" element={<PageTransition><ResultsPage /></PageTransition>} />
              <Route path="/programmes/:programmeId/results/:resultId/certificate" element={<PageTransition><CertificatePage /></PageTransition>} />
              <Route path="/schedule" element={<PageTransition><SchedulePage /></PageTransition>} />
              <Route path="/gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
              <Route path="*" element={<PageTransition><div className="min-h-screen flex items-center justify-center font-display text-4xl uppercase font-black">Page Not Found</div></PageTransition>} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}

      {!settingsLoading && isMaintenance && (
        <div className={!loadingComplete ? 'hidden' : ''}>
          <MaintenancePage message={appSettings?.maintenanceMessage} />
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
