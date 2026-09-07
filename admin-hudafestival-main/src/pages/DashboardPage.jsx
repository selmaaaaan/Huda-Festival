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
        <p className="text-sm text-[var(--color-text-body)] mt-1">Operations dashboard overview.</p>
      </div>

      {loading ? (
        <p className="text-[var(--color-text-body)]">Loading metrics...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="Active Teams" value={stats.teams} color="bg-primary/10 text-primary" />
            <StatCard icon={Calendar} label="Programmes" value={stats.programmes} color="bg-accent-programmes/10 text-accent-programmes" />
            <StatCard icon={Trophy} label="Candidates" value={stats.candidates} color="bg-accent-candidates/10 text-accent-candidates" />
            <StatCard icon={BarChart3} label="Published Results" value={stats.published} color="bg-accent-results/10 text-accent-results" />
          </div>

          <GettingStartedCard counts={stats} />
        </>
      )}
    </div>
  );
};

export default DashboardPage;