import React, { useEffect, useState } from 'react';
import { Users, Calendar, Trophy, BarChart3 } from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import GettingStartedCard from '../components/GettingStartedCard';

const DashboardPage = () => {
  const [stats, setStats] = useState({ teams: 0, programmes: 0, candidates: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamsRes, progsRes, candsRes] = await Promise.all([
          api.get('/teams'),
          api.get('/programmes'),
          api.get('/candidates'),
        ]);
        setStats({
          teams: teamsRes.data.length,
          programmes: progsRes.data.length,
          candidates: candsRes.data.length,
          published: progsRes.data.filter(p => p.isResultPublished).length,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">
          Welcome back, {userInfo?.userName || 'Admin'}
        </h1>
        <p className="text-sm text-[var(--color-text-body)] mt-1">Here's what's happening with your festival.</p>
      </div>

      {loading ? (
        <p className="text-[var(--color-text-body)]">Loading stats...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="Teams" value={stats.teams} color="bg-blue-50 text-blue-600" />
            <StatCard icon={Calendar} label="Programmes" value={stats.programmes} color="bg-purple-50 text-purple-600" />
            <StatCard icon={Trophy} label="Candidates" value={stats.candidates} color="bg-orange-50 text-orange-600" />
            <StatCard icon={BarChart3} label="Published" value={stats.published} color="bg-green-50 text-green-600" />
          </div>

          <GettingStartedCard counts={stats} />
        </>
      )}
    </div>
  );
};

export default DashboardPage;