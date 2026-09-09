import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from 'framer-motion';
import { SectionHeading } from '../components/ui';
import api from '../services/api';
import LeaderboardTable from '../components/results/LeaderboardTable';

const LeaderboardsPage = () => {
    const prefersReducedMotion = useReducedMotion();
    const [leaderboardData, setLeaderboardData] = useState({
        overall: [],
        categories: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const { data } = await api.get('/leaderboards');
                setLeaderboardData(data);
            } catch (error) {
                console.error("Error fetching leaderboards:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboards();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-display text-2xl uppercase font-black">Loading...</div>;

    const overallTop = (leaderboardData.overall || []).slice(0, 3);
    const overallRest = (leaderboardData.overall || []).slice(3);

    return (
        <div className="min-h-screen bg-[var(--festival-cream)] py-24 px-6 md:px-12">
            <div className="max-w-[1440px] mx-auto">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b-2 border-[var(--border)] pb-8">
                    <SectionHeading subtitle="Talent. Teamwork. Triumph." align="left">
                        Festival <br/>
                        <span className="text-[var(--festival-teal)]">Leaderboard</span>
                    </SectionHeading>
                    <p className="font-bold text-sm uppercase tracking-widest text-right hidden md:block">
                        More <br/> Than A Score
                    </p>
                </div>

                {/* Top 3 Podium */}
                {overallTop.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end">
                        {/* 1st Place - Center (rendered 2nd in DOM, but we use flex order for visual) */}
                        {overallTop[0] && (
                            <motion.div 
                                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                className="order-1 md:order-2 bg-[var(--festival-black)] border-4 border-[var(--border)] shadow-[12px_12px_0px_0px_rgba(23,23,23,1)] p-8 flex flex-col items-center justify-center text-center h-80"
                                style={{ backgroundColor: overallTop[0].color || 'var(--festival-teal)' }}
                            >
                                <span className="text-8xl font-black font-display text-[var(--festival-cream)] leading-none opacity-90 drop-shadow-md">01</span>
                                <h3 className="text-4xl font-black font-display uppercase tracking-tight text-[var(--festival-cream)] mt-4 drop-shadow-md">{overallTop[0].name}</h3>
                                <p className="text-xl font-bold font-display text-[var(--festival-cream)] mt-2 drop-shadow-md">{overallTop[0].totalPoints} PTS</p>
                            </motion.div>
                        )}
                        
                        {/* 2nd Place - Left */}
                        {overallTop[1] && (
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                                className="order-2 md:order-1 bg-[var(--festival-black)] border-4 border-[var(--border)] shadow-[8px_8px_0px_0px_rgba(23,23,23,1)] p-6 flex flex-col items-center justify-center text-center h-64"
                                style={{ backgroundColor: overallTop[1].color || 'var(--festival-orange)' }}
                            >
                                <span className="text-6xl font-black font-display text-[var(--festival-cream)] leading-none opacity-90 drop-shadow-md">02</span>
                                <h3 className="text-2xl font-black font-display uppercase tracking-tight text-[var(--festival-cream)] mt-4 drop-shadow-md">{overallTop[1].name}</h3>
                                <p className="text-lg font-bold font-display text-[var(--festival-cream)] mt-1 drop-shadow-md">{overallTop[1].totalPoints} PTS</p>
                            </motion.div>
                        )}

                        {/* 3rd Place - Right */}
                        {overallTop[2] && (
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                                className="order-3 md:order-3 bg-[var(--festival-black)] border-4 border-[var(--border)] shadow-[8px_8px_0px_0px_rgba(23,23,23,1)] p-6 flex flex-col items-center justify-center text-center h-56"
                                style={{ backgroundColor: overallTop[2].color || 'var(--festival-purple)' }}
                            >
                                <span className="text-5xl font-black font-display text-[var(--festival-cream)] leading-none opacity-90 drop-shadow-md">03</span>
                                <h3 className="text-2xl font-black font-display uppercase tracking-tight text-[var(--festival-cream)] mt-4 drop-shadow-md">{overallTop[2].name}</h3>
                                <p className="text-lg font-bold font-display text-[var(--festival-cream)] mt-1 drop-shadow-md">{overallTop[2].totalPoints} PTS</p>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Rest of the table */}
                <div className="bg-white border-2 border-[var(--border)] shadow-[8px_8px_0px_0px_rgba(23,23,23,1)]">
                    <LeaderboardTable data={overallRest} startingRank={4} />
                </div>

                {/* Category Leaderboards (Optional display, keeping it minimal) */}
                {Object.keys(leaderboardData.categories).length > 0 && (
                    <div className="mt-32">
                        <h2 className="text-4xl font-black font-display uppercase tracking-tight mb-12">Category Standings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Object.entries(leaderboardData.categories).map(([category, teams], index) => (
                                <motion.div key={category} initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }} whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={prefersReducedMotion ? {} : { y: -6, rotate: index % 2 === 0 ? 1 : -1, scale: 1.02 }}
                                    className="border-2 border-[var(--border)] bg-white p-6 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)]"
                                >
                                    <h3 className="text-xl font-black font-display uppercase mb-6 pb-2 border-b-2 border-[var(--border)]">{category}</h3>
                                    <LeaderboardTable data={teams} compact /></motion.div>))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardsPage;
