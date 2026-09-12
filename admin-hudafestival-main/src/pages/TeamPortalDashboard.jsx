import React, { useState, useEffect } from 'react';
import { Users, Calendar, Trophy, Star, Bell } from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import NotificationsPage from './NotificationsPage';

export default function TeamPortalDashboard() {
  const [stats, setStats] = useState({ candidates: 0, programmes: 0, points: 0, rank: 0 });
  const [team, setTeam] = useState(null);
  const [toppers, setToppers] = useState([]);
  const [categoryPoints, setCategoryPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [teamRes, allTeamsRes, candsRes, progsRes] = await Promise.all([
          api.get(`/teams/${userInfo.team}`),
          api.get('/teams'),
          api.get('/candidates'),
          api.get('/programmes')
        ]);
        
        const myTeam = teamRes.data;
        setTeam(myTeam);
        
        const myCandidates = candsRes.data;
        
        // Calculate Toppers
        const tops = [...myCandidates]
            .filter(c => c.totalPoints > 0)
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, 5);
        setToppers(tops);
        
        // Calculate Category Points
        const catPointsMap = {};
        myCandidates.forEach(c => {
            if (c.totalPoints) {
                catPointsMap[c.category] = (catPointsMap[c.category] || 0) + c.totalPoints;
            }
        });
        const catPointsArr = Object.entries(catPointsMap)
            .map(([cat, pts]) => ({ category: cat, points: pts }))
            .sort((a, b) => b.points - a.points);
        setCategoryPoints(catPointsArr);

        // Calculate Rank
        const sortedTeams = allTeamsRes.data.sort((a, b) => b.totalPoints - a.totalPoints);
        const myRank = sortedTeams.findIndex(t => t._id === userInfo.team) + 1;
        
        setStats({
          candidates: myCandidates.length,
          programmes: progsRes.data.length,
          points: myTeam.totalPoints || 0,
          rank: myRank
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    if (userInfo.team) fetchDashboard();
  }, [userInfo.team]);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="w-full flex flex-col h-full bg-[var(--color-bg)]">
      {/* Scrollable Content Wrapper */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Team Dashboard</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Welcome back, {team?.name}!</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Points"
            value={stats.points}
            icon={Star}
            color="var(--color-primary)"
            trend="+0 this week"
          />
          <StatCard
            title="Current Rank"
            value={`#${stats.rank}`}
            icon={Trophy}
            color="#EAB308"
            trend="Leaderboard"
          />
          <StatCard
            title="Registered Candidates"
            value={stats.candidates}
            icon={Users}
            color="#10B981"
            trend="Team Size"
          />
          <StatCard
            title="Total Programmes"
            value={stats.programmes}
            icon={Calendar}
            color="#F43F5E"
            trend="Available to compete"
          />
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Team Toppers */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-6 flex flex-col min-h-[300px]">
                <h3 className="font-bold text-lg text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
                    <Star size={18} className="text-amber-500" /> Team Toppers
                </h3>
                {toppers.length > 0 ? (
                    <div className="space-y-3 overflow-y-auto pr-2">
                        {toppers.map((cand, idx) => (
                            <div key={cand._id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-[var(--color-text-muted)] text-sm w-4">{idx + 1}</div>
                                    <div>
                                        <div className="font-bold text-[var(--color-text-heading)]">{cand.name}</div>
                                        <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{cand.category}</div>
                                    </div>
                                </div>
                                <div className="text-lg font-bold text-[var(--color-primary)]">{cand.totalPoints} pts</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-[var(--color-text-muted)] italic m-auto">No points scored yet.</div>
                )}
            </div>

            {/* Category Performance */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-6 flex flex-col min-h-[300px]">
                <h3 className="font-bold text-lg text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-emerald-500" /> Category Performance
                </h3>
                {categoryPoints.length > 0 ? (
                    <div className="space-y-3 overflow-y-auto pr-2">
                        {categoryPoints.map((cp, idx) => (
                            <div key={cp.category} className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                                <div className="font-bold text-[var(--color-text-heading)]">{cp.category}</div>
                                <div className="text-lg font-bold text-[var(--color-primary)]">{cp.points} pts</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-[var(--color-text-muted)] italic m-auto">No category points yet.</div>
                )}
            </div>
        </div>

        {/* Notification Center */}
        <div className="mt-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Bell size={20} className="text-[var(--color-primary)]" />
              Notification Center
            </h2>
          </div>
          {/* We can just render the NotificationsPage component here inline! */}
          <div className="flex-1 relative">
            <NotificationsPage inline={true} />
          </div>
        </div>
      </div>
    </div>
  );
}