import React from 'react';
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
import { useState } from 'react';

function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <BrowserRouter>
      {!loadingComplete && <LoadingScreen onComplete={() => setLoadingComplete(true)} />}
      {/* This main div acts as the container for our entire application */}
      <div className={`bg-[var(--color-public-bg)] font-sans min-h-screen ${!loadingComplete ? 'hidden' : ''}`}>
        <Navbar />
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
    </BrowserRouter>
  );
}

export default App;