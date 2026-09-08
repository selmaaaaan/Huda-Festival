import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import ProgrammesPage from './pages/ProgrammeListPage';
import LeaderboardsPage from './pages/LeaderboardsPage';
import ResultsPage from './pages/ResultPage'
import SearchPage from './pages/CandidateSearchPage';
import CertificatePage from './pages/CertificateViewPage';

// 1. Import the necessary components from react-router-dom
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import ControllersPage from './pages/ControllersPage';
import SchedulePage from './pages/SchedulePage';
import GalleryPage from './pages/GalleryPage';
import LoadingScreen from './components/LoadingScreen';
import NotificationBanner from './components/NotificationBanner';
import MaintenancePage from './components/MaintenancePage';
import api from './services/api';

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
  // We keep the LoadingScreen mounted until it fires onComplete (which sets loadingComplete to true)
  // It won't fire onComplete until both its internal timer finishes AND isReady (!settingsLoading) is true.

  return (
    <BrowserRouter>
      {!loadingComplete && (
        <LoadingScreen 
          isReady={!settingsLoading} 
          onComplete={() => setLoadingComplete(true)} 
        />
      )}
      
      {/* If settings are loaded and we are NOT in maintenance mode, show the normal app */}
      {!settingsLoading && !isMaintenance && (
        <div className={`bg-[var(--color-public-bg)] font-sans min-h-screen ${!loadingComplete ? 'hidden' : ''}`}>
          <Navbar />
          <NotificationBanner />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/leaderboards" element={<LeaderboardsPage />} />
              <Route path="/programmes" element={<ProgrammesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/programmes/:programmeId/results" element={<ResultsPage />} />
              <Route path="/programmes/:programmeId/results/:resultId/certificate" element={<CertificatePage />} />
              <Route path="/controllers" element={<ControllersPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/gallery" element={<GalleryPage />} />
            </Routes>
          </main>
        </div>
      )}

      {/* If settings are loaded and we ARE in maintenance mode, show MaintenancePage */}
      {!settingsLoading && isMaintenance && (
        <div className={!loadingComplete ? 'hidden' : ''}>
          <MaintenancePage message={appSettings?.maintenanceMessage} />
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;