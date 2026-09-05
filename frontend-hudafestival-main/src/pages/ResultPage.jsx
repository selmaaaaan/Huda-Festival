import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const ResultsPage = () => {
  const { programmeId } = useParams();
  const [programme, setProgramme] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!programmeId) return;
      try {
        setLoading(true);
        const [progRes, resultsRes] = await Promise.all([
          api.get(`/programmes/${programmeId}`),
          api.get(`/programmes/${programmeId}/results`),
        ]);
        setProgramme(progRes.data);
        const resultsWithCandidates = await Promise.all(
          resultsRes.data.map(async (result) => {
            const candidateRes = await api.get(`/candidates/${result.candidate}`);
            return { ...result, candidate: candidateRes.data };
          })
        );
        resultsWithCandidates.sort((a, b) => {
          if (a.rank === null) return 1;
          if (b.rank === null) return -1;
          return a.rank - b.rank;
        });
        setResults(resultsWithCandidates);
      } catch { setError('Failed to load results.'); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, [programmeId]);

  const getRankText = (rank) => {
    if (rank === 1) return '🥇 1st Place';
    if (rank === 2) return '🥈 2nd Place';
    if (rank === 3) return '🥉 3rd Place';
    return '';
  };

  if (loading) return <div className="text-center p-10 text-[var(--color-text-body)]">Loading Results...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 mt-16">
      <Link to="/programmes" className="text-sm text-[var(--color-primary)] hover:underline mb-4 inline-block">← Back to All Programmes</Link>
      <h1 className="text-3xl font-bold text-center text-[var(--color-text-heading)] mb-1">Results: {programme?.name}</h1>
      <p className="text-center text-[var(--color-text-body)] mb-8">{programme?.type}</p>

      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-body)]">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-body)]">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-body)]">Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-body)]">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {results.filter(r => r.rank).map((result) => (
              <tr key={result._id} className="hover:bg-[var(--color-public-bg)] transition">
                <td className="px-6 py-4 font-bold text-sm">{getRankText(result.rank)}</td>
                <td className="px-6 py-4 font-medium text-[var(--color-text-heading)] flex items-center">
                  <img src={result.candidate.image.url} alt={result.candidate.name} className="w-10 h-10 rounded-full object-cover mr-4 border flex-shrink-0" style={{ width: '40px', height: '40px' }} />
                  {result.candidate.name}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-body)]">{result.candidate.team.name}</td>
                <td className="px-6 py-4"><span className="text-sm font-semibold text-[var(--color-primary)]">{result.grade}</span></td>
              </tr>
            ))}
            {results.filter(r => !r.rank && r.grade).map((result) => (
              <tr key={result._id} className="hover:bg-[var(--color-public-bg)] transition">
                <td className="px-6 py-4 text-sm text-[var(--color-text-body)]">--</td>
                <td className="px-6 py-4 font-medium text-[var(--color-text-heading)] flex items-center">
                  <img src={result.candidate.image.url} alt={result.candidate.name} className="w-10 h-10 rounded-full object-cover mr-4 border flex-shrink-0" style={{ width: '40px', height: '40px' }} />
                  {result.candidate.name}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-body)]">{result.candidate.team.name}</td>
                <td className="px-6 py-4"><span className="text-sm font-semibold text-[var(--color-primary)]">{result.grade}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsPage;