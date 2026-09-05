import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Constants
const RANK_CONFIG = {
  1: { 
    color: 'from-yellow-400 to-yellow-200', 
    emoji: '🥇', 
    shadow: 'shadow-yellow-200/60',
    glow: 'shadow-2xl shadow-yellow-400/50',
    size: 'w-32 h-32'
  },
  2: { 
    color: 'from-gray-400 to-gray-200', 
    emoji: '🥈', 
    shadow: 'shadow-gray-200/60',
    glow: 'shadow-xl shadow-gray-400/40',
    size: 'w-28 h-28'
  },
  3: { 
    color: 'from-yellow-600 to-yellow-400', 
    emoji: '🥉', 
    shadow: 'shadow-yellow-400/60',
    glow: 'shadow-xl shadow-yellow-600/40',
    size: 'w-28 h-28'
  }
};

const INITIAL_STATE = {
  programmes: [],
  loading: true,
  error: ''
};

// Custom hook for data fetching
const useProgrammesData = () => {
  const [state, setState] = useState(INITIAL_STATE);

  const fetchProgrammesData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      
      const [programmesResponse, candidatesResponse] = await Promise.all([
        api.get('/programmes'),
        api.get('/candidates')
      ]);

      const programmes = programmesResponse.data.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      const candidatesMap = new Map(candidatesResponse.data.map(c => [c._id, c]));
      const publishedProgrammes = programmes.filter(p => p.isResultPublished);

      // Fetch results only for published programmes
      const resultsResponses = await Promise.all(
        publishedProgrammes.map(p => api.get(`/programmes/${p._id}/results`))
      );

      const resultsMap = new Map(
        publishedProgrammes.map((prog, index) => [prog._id, resultsResponses[index].data])
      );

      const enrichedProgrammes = programmes.map(prog => 
        enrichProgrammeWithWinners(prog, resultsMap, candidatesMap)
      );

      setState({
        programmes: enrichedProgrammes,
        loading: false,
        error: ''
      });

    } catch (err) {
      console.error('Failed to fetch programmes:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load programmes and results. Please try again later.'
      }));
    }
  }, []);

  useEffect(() => {
    fetchProgrammesData();
  }, [fetchProgrammesData]);

  return { ...state, refetch: fetchProgrammesData };
};

// Helper functions
const enrichProgrammeWithWinners = (programme, resultsMap, candidatesMap) => {
  if (!programme.isResultPublished || !resultsMap.has(programme._id)) {
    return programme;
  }

  const programmeResults = resultsMap.get(programme._id);
  const winners = programmeResults
    .filter(result => result.rank >= 1 && result.rank <= 3)
    .sort((a, b) => a.rank - b.rank)
    .map(winnerResult => ({
      ...winnerResult,
      candidate: candidatesMap.get(winnerResult.candidate)
    }));

  return { ...programme, winners };
};

const getRankDisplay = (rank) => RANK_CONFIG[rank] || { 
  color: 'from-gray-200 to-gray-100', 
  emoji: '', 
  shadow: 'shadow-gray-200/30',
  glow: 'shadow-md',
  size: 'w-24 h-24'
};

// Sub-components
const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse mx-auto shadow-lg"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-gray-600 font-medium">Loading Programmes...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
    <div className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 border border-gray-100">
      <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg mb-6">
        <span className="text-3xl text-white">⚠️</span>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h3>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        Try Again
      </button>
    </div>
  </div>
);

const WinnerCard = ({ winner }) => {
  const { color, emoji, shadow, glow, size } = getRankDisplay(winner.rank);
  
  return (
    <div className="flex flex-col items-center group">
      {/* Circular Candidate Card */}
      <div className={`relative mb-3 transform transition-all duration-300 hover:scale-110 hover:${glow}`}>
        <div className={`${size} bg-gradient-to-br ${color} rounded-full flex items-center justify-center p-1 shadow-xl ${shadow} border-4 border-white`}>
          <div className="w-full h-full rounded-full bg-white shadow-inner flex items-center justify-center overflow-hidden">
            <img 
              src={winner.candidate?.image?.url} 
              alt={winner.candidate?.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>
        </div>
        
        {/* Rank Emoji Badge */}
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border">
          <span className="text-lg">{emoji}</span>
        </div>
        
        {/* Rank Number */}
        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
          {winner.rank}
        </div>
      </div>

      {/* Candidate Info */}
      <div className="text-center max-w-32">
        <p className="font-semibold text-gray-800 text-sm truncate">
          {winner.candidate?.name || 'Unknown'}
        </p>
        <p className="text-xs text-gray-600 truncate">
          {winner.candidate?.team?.name || 'No Team'}
        </p>
      </div>
    </div>
  );
};

const ProgrammeCard = ({ programme }) => {
  const hasWinners = programme.winners && programme.winners.length > 0;

  // Sort winners and arrange in specific order: 3rd (left), 1st (middle), 2nd (right)
  const getSortedWinners = () => {
    if (!hasWinners) return [];
    
    const winnersMap = {};
    programme.winners.forEach(winner => {
      winnersMap[winner.rank] = winner;
    });
    
    // Return in the order: 3rd, 1st, 2nd
    return [
      winnersMap[3], // Left position
      winnersMap[1], // Center position (largest)
      winnersMap[2]  // Right position
    ].filter(Boolean); // Remove any undefined entries
  };

  const sortedWinners = getSortedWinners();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-gray-200">
      {/* Programme Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {programme.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {programme.type}
              </span>
              <span className="flex items-center">
                📅 {new Date(programme.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
          
          {programme.isResultPublished ? (
            <Link 
              to={`/programmes/${programme._id}/results`}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
            >
              View Full Results
            </Link>
          ) : (
            <span className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-semibold shadow-lg whitespace-nowrap">
              Results Pending
            </span>
          )}
        </div>
      </div>
      
      {/* Winners Section with Circular Cards */}
      {hasWinners && (
        <div className="p-8 bg-gradient-to-br from-gray-50/50 to-blue-50/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-sm">
                🏆
              </span>
              Winners
            </h3>
            <div className="text-sm text-gray-500">
              {programme.winners.length} winner{programme.winners.length > 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Winners Grid with Specific Order */}
          <div className="flex justify-center items-end gap-8 lg:gap-12 px-4">
            {/* 3rd Place - Left */}
            {sortedWinners[0] && (
              <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <div className="mb-2">
                  <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    3rd Place
                  </div>
                </div>
                <WinnerCard winner={sortedWinners[0]} />
              </div>
            )}
            
            {/* 1st Place - Middle (Largest) */}
            {sortedWinners[1] && (
              <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <div className="mb-2">
                  <div className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                    Champion
                  </div>
                </div>
                <WinnerCard winner={sortedWinners[1]} />
              </div>
            )}
            
            {/* 2nd Place - Right */}
            {sortedWinners[2] && (
              <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <div className="mb-2">
                  <div className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    2nd Place
                  </div>
                </div>
                <WinnerCard winner={sortedWinners[2]} />
              </div>
            )}
          </div>

          {/* Podium Visualization (Optional decorative element) */}
          <div className="mt-8 flex justify-center items-end gap-8 max-w-md mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-20 h-8 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-t-lg"></div>
              <div className="text-xs text-gray-500 mt-1">3rd</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-16 bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-t-lg"></div>
              <div className="text-xs text-gray-500 mt-1">1st</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-12 bg-gradient-to-r from-gray-400 to-gray-200 rounded-t-lg"></div>
              <div className="text-xs text-gray-500 mt-1">2nd</div>
            </div>
          </div>
        </div>
      )}

      {/* No Winners State */}
      {!hasWinners && programme.isResultPublished && (
        <div className="p-8 bg-gradient-to-br from-gray-50/50 to-blue-50/50 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Winners Announced</h3>
          <p className="text-gray-500 text-sm">Results are published but winners haven't been announced yet.</p>
        </div>
      )}
    </div>
  );
};

// Main component
const ProgrammesPage = () => {
  const { programmes, loading, error, refetch } = useProgrammesData();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="min-h-screen bg-[var(--color-public-bg)] py-8 mt-16">
      <div className="container my-5 mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block relative mb-6">


          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Festival Programmes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover all programmes and celebrate the outstanding winners showcased in our new circular design.
          </p>
        </div>

        {/* Programmes List */}
        <div className="space-y-8">
          {programmes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-5xl"></span>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">
                No Programmes Available
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                There are no programmes scheduled at the moment. Please check back later for updates.
              </p>
            </div>
          ) : (
            programmes.map(programme => (
              <ProgrammeCard key={programme._id} programme={programme} />
            ))
          )}
        </div>


      </div>
    </div>
  );
};

export default ProgrammesPage;