import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateResults, setCandidateResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true); setSearched(true); setSelectedCandidate(null);
    try { const { data } = await api.get(`/candidates/search?term=${searchTerm}`); setSearchResults(data); }
    catch { setSearchResults([]); } finally { setLoading(false); }
  };

  const handleSelectCandidate = async (candidate) => {
    setSelectedCandidate(candidate); setLoadingResults(true);
    try { const { data } = await api.get(`/candidates/${candidate._id}/results`); setCandidateResults(data); }
    catch { console.error('Failed to fetch results'); } finally { setLoadingResults(false); }
  };

  if (!selectedCandidate) {
    return (
      <div className="container mx-auto p-4 md:p-8 mt-16">
        <h1 className="text-3xl font-bold text-center text-[var(--color-text-heading)] mb-6">Candidate Search</h1>
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter name or admission number..."
            className="flex-grow px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition" />
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl transition disabled:opacity-50">
            {loading ? '...' : 'Search'}
          </button>
        </form>

        <div className="max-w-xl mx-auto mt-8">
          {loading && <p className="text-center text-[var(--color-text-body)]">Searching...</p>}
          {!loading && searched && searchResults.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><span className="text-2xl">🔍</span></div>
              <p className="font-semibold text-[var(--color-text-heading)]">No candidates found</p>
              <p className="text-sm text-[var(--color-text-body)]">Try a different search term</p>
            </div>
          )}
          {!loading && searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map(candidate => (
                <div key={candidate._id} onClick={() => handleSelectCandidate(candidate)}
                  className="bg-white p-4 rounded-xl border border-[var(--color-border)] flex items-center gap-4 hover:border-[var(--color-primary)] cursor-pointer transition">
                  <img src={candidate.image.url} alt={candidate.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[var(--color-text-heading)] truncate">{candidate.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium bg-gray-100 text-[var(--color-text-body)] px-2 py-0.5 rounded-full">{candidate.admissionNo}</span>
                      {candidate.team?.name && <span className="text-xs font-medium px-2 py-0.5 rounded-full border" style={{ borderColor: candidate.team?.color || '#3b82f6', color: candidate.team?.color || '#1d4ed8', backgroundColor: `${candidate.team?.color || '#3b82f6'}10` }}>{candidate.team.name}</span>}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-[var(--color-primary)]">{candidate.totalPoints || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 mt-16">
      <button onClick={() => setSelectedCandidate(null)} className="text-sm text-[var(--color-primary)] hover:underline mb-6 inline-block">← Back to Search Results</button>
      <div className="text-center mb-8">
        <img src={selectedCandidate.image.url} alt={selectedCandidate.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg mx-auto" />
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mt-4">{selectedCandidate.name}</h1>
        <div className="flex justify-center gap-2 mt-2">
          {selectedCandidate.team?.name && <span className="text-xs font-medium px-3 py-1 rounded-full border" style={{ borderColor: selectedCandidate.team?.color || '#3b82f6', color: selectedCandidate.team?.color || '#1d4ed8', backgroundColor: `${selectedCandidate.team?.color || '#3b82f6'}10` }}>{selectedCandidate.team.name}</span>}
          <span className="text-xs font-medium bg-gray-100 text-[var(--color-text-body)] px-3 py-1 rounded-full">{selectedCandidate.category}</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-center text-[var(--color-text-heading)] mb-6">Achievements</h2>
      {loadingResults && <p className="text-center text-[var(--color-text-body)]">Loading achievements...</p>}
      {!loadingResults && candidateResults.length === 0 && (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><span className="text-2xl">🏆</span></div>
          <p className="font-semibold text-[var(--color-text-heading)]">No achievements recorded</p>
          <p className="text-sm text-[var(--color-text-body)]">Results will appear once published</p>
        </div>
      )}
      {!loadingResults && candidateResults.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-3">
          {candidateResults.map(result => result.programme && (
            <div key={result._id} className="bg-white p-4 rounded-xl border border-[var(--color-border)] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <p className="font-semibold text-[var(--color-text-heading)]">{result.programme?.name || 'Programme unavailable'}</p>
                <p className="text-sm text-[var(--color-text-body)]">
                  {result.rank && `Rank: ${result.rank}`}{result.rank && result.grade && ' | '}{result.grade && `Grade: ${result.grade}`}
                </p>
              </div>
              <Link to={`/programmes/${result.programme?._id}/results/${result._id}/certificate`}
                className="w-full sm:w-auto text-center px-4 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl transition">
                View Certificate
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;