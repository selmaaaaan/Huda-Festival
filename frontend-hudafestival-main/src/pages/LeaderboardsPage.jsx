import React, { useEffect, useState } from "react";
import LeaderboardTable from "../components/LeaderboardTable";
import api from '../services/api';

const Spinner = () => (
    <div className="flex flex-col justify-center items-center min-h-64 space-y-4">
        <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-2xl"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">Loading Leaderboards</p>
            <p className="text-sm text-gray-500">Preparing the podium...</p>
        </div>
    </div>
);

const MedalBadge = ({ position, size = "medium" }) => {
    const sizes = {
        small: "w-8 h-8 text-sm",
        medium: "w-12 h-12 text-lg",
        large: "w-16 h-16 text-xl"
    };

    const medalConfig = {
        1: {
            gradient: "from-yellow-400 to-yellow-600",
            shadow: "shadow-yellow-500/50",
            emoji: "🥇",
            label: "Gold"
        },
        2: {
            gradient: "from-gray-300 to-gray-500",
            shadow: "shadow-gray-400/50",
            emoji: "🥈",
            label: "Silver"
        },
        3: {
            gradient: "from-orange-400 to-orange-600",
            shadow: "shadow-orange-500/50",
            emoji: "🥉",
            label: "Bronze"
        }
    };

    const medal = medalConfig[position];

    return (
        <div className="flex flex-col items-center">
            <div className={`${sizes[size]} bg-gradient-to-br ${medal.gradient} rounded-full flex items-center justify-center text-white font-bold shadow-lg ${medal.shadow} border-2 border-white/20 transform hover:scale-110 transition-transform duration-300`}>
                {medal.emoji}
            </div>
            {size !== "small" && (
                <span className="text-xs font-semibold mt-1 text-gray-600">{medal.label}</span>
            )}
        </div>
    );
};

const LeaderboardsPage = () => {
    const [leaderboards, setLeaderboards] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('teams');

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/leaderboards');
                setLeaderboards(data);
            } catch (err) {
                setError('Failed to load leaderboards. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboards();
    }, []);

    const getRankStyle = (index) => {
        switch(index) {
            case 0: // 1st Place - Gold
                return {
                    container: "relative bg-gradient-to-r from-yellow-50 via-yellow-25 to-yellow-50 border-l-4 border-yellow-400 shadow-lg",
                    rank: "gold",
                    glow: "shadow-lg shadow-yellow-400/30",
                    points: "text-yellow-600 font-black"
                };
            case 1: // 2nd Place - Silver
                return {
                    container: "relative bg-gradient-to-r from-gray-50 via-gray-25 to-gray-50 border-l-4 border-gray-400 shadow-md",
                    rank: "silver",
                    glow: "shadow-md shadow-gray-400/30",
                    points: "text-gray-600 font-black"
                };
            case 2: // 3rd Place - Bronze
                return {
                    container: "relative bg-gradient-to-r from-orange-50 via-orange-25 to-orange-50 border-l-4 border-orange-400 shadow-md",
                    rank: "bronze",
                    glow: "shadow-md shadow-orange-400/30",
                    points: "text-orange-600 font-black"
                };
            default:
                return {
                    container: "bg-white/80 hover:bg-blue-50/80 backdrop-blur-sm",
                    rank: "default",
                    glow: "",
                    points: "text-blue-600 font-bold"
                };
        }
    };

    const RankNumber = ({ index }) => {
        if (index < 3) {
            return <MedalBadge position={index + 1} size="small" />;
        }
        
        return (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {index + 1}
            </div>
        );
    };

    const renderTeamRow = (team, index) => {
        const style = getRankStyle(index);
        
        return (
            <div key={team._id} className={`rounded-xl p-6 mb-4 transform transition-all duration-300 hover:scale-105 ${style.container} ${style.glow}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <RankNumber index={index} />
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color || '#6B7280' }}></span>
                                {team.name}
                            </h3>
                            {index < 3 && (
                                <p className="text-sm font-semibold text-gray-600 capitalize">
                                    {index === 0 ? 'Champion Team' : index === 1 ? 'Silver Medal Team' : 'Bronze Medal Team'}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl ${style.points}`}>{team.totalPoints}</div>
                        <div className="text-sm text-gray-500 font-medium">points</div>
                    </div>
                </div>
                
                {/* Progress bar for visual ranking */}
                {index < 3 && (
                    <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full bg-gradient-to-r ${
                                    index === 0 ? 'from-yellow-400 to-yellow-600' :
                                    index === 1 ? 'from-gray-400 to-gray-600' :
                                    'from-orange-400 to-orange-600'
                                }`}
                                style={{ width: `${100 - (index * 25)}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

const renderStudentRow = (student, index) => {
    const style = getRankStyle(index);
    
    return (
        <div key={student._id} className={`rounded-xl p-4 sm:p-6 mb-4 transform transition-all duration-300 hover:scale-105 ${style.container} ${style.glow}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0"> {/* Added min-w-0 to prevent overflow */}
                    <RankNumber index={index} />
                    
                    {/* CHANGE 1: Added flex-shrink-0 to this container */}
                    <div className="relative flex-shrink-0"> 
                        <img
                              src={student.image.url}
                              alt={student.name}
                              // CHANGE 2: Replaced responsive width with fixed size
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
                            />

                        {index < 3 && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                                <span className="text-xs">⭐</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Added min-w-0 here to allow text to truncate if needed */}
                    <div className="flex-1 min-w-0"> 
                        {/* Made name text responsive and able to truncate */}
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">{student.name}</h3>
                        <div className="flex items-center flex-wrap gap-2 mt-1"> {/* Added flex-wrap and gap */}
                            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                {student.team?.name || 'Independent'}
                            </span>
                            <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                                Adm: {student.admissionNo || 'N/A'}
                            </span>
                            {index < 3 && (
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/80 text-gray-700">
                                    {index === 0 ? 'Gold Medalist' : index === 1 ? 'Silver Medalist' : 'Bronze Medalist'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="text-right">
                    <div className={`text-xl sm:text-2xl ${style.points}`}>{student.totalPoints}</div>
                    <div className="text-sm text-gray-500 font-medium">points</div>
                </div>
            </div>
        </div>
    );
};

    const PodiumDisplay = ({ data, type = 'teams' }) => {
    if (!data || data.length < 3) return null;

    return (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-2xl border border-blue-100 mb-8">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
                🏆 Championship Podium
            </h3>
            <div className="flex justify-center items-end space-x-4 h-64">
                {/* 2nd Place */}
                <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                    <div className="w-20 h-32 bg-gradient-to-br from-gray-300 to-gray-500 rounded-t-2xl shadow-2xl flex items-end justify-center p-4">
                        <MedalBadge position={2} size="medium" />
                    </div>
                    <div className="text-center mt-4">
                        <p className="font-bold text-gray-700 text-sm">{data[1]?.name}</p>
                        {/* UPDATED: Changed admissionNumber to admissionNo */}
                        <p className="text-xs text-gray-600">Adm: {data[1]?.admissionNo || 'N/A'}</p>
                        <p className="text-lg font-black text-gray-600">{data[1]?.totalPoints}</p>
                    </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
                    <div className="w-24 h-40 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-t-2xl shadow-2xl flex items-end justify-center p-4 -mt-8">
                        <MedalBadge position={1} size="large" />
                    </div>
                    <div className="text-center mt-4">
                        <p className="font-bold text-gray-700 text-sm">{data[0]?.name}</p>
                        {/* UPDATED: Changed admissionNumber to admissionNo */}
                        <p className="text-xs text-gray-600">Adm: {data[0]?.admissionNo || 'N/A'}</p>
                        <p className="text-xl font-black text-yellow-600">{data[0]?.totalPoints}</p>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                    <div className="w-20 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-2xl shadow-2xl flex items-end justify-center p-4">
                        <MedalBadge position={3} size="medium" />
                    </div>
                    <div className="text-center mt-4">
                        <p className="font-bold text-gray-700 text-sm">{data[2]?.name}</p>
                        {/* UPDATED: Changed admissionNumber to admissionNo */}
                        <p className="text-xs text-gray-600">Adm: {data[2]?.admissionNo || 'N/A'}</p>
                        <p className="text-lg font-black text-orange-600">{data[2]?.totalPoints}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

    if (loading) return (
        <div className="min-h-screen bg-[var(--color-public-bg)] flex items-center justify-center mt-16">
            <Spinner />
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-[var(--color-public-bg)] flex items-center justify-center mt-16">
            <div className="text-center bg-white rounded-3xl p-8 shadow-2xl max-w-md mx-4">
                <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl text-white">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Failed</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--color-public-bg)] py-8 mt-16">
            <div className="container mx-auto px-4 md:px-8 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12 mx-auto my-15">
                    <h1 className="text-5xl md:text-6xl font-black text-[var(--color-primary)] mb-4">
                        Leaderboards
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Celebrating excellence across teams and individuals in spectacular fashion
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200">
                        <div className="flex space-x-2">
                            {['teams', 'students', 'categories'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                        activeTab === tab
                                            ? 'bg-[var(--color-primary)] text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                    }`}
                                >
                                    {tab === 'teams' && 'Teams Rank'}
                                    {tab === 'students' && ' Overall Toppers '}
                                    {tab === 'categories' && ' Toppers By Category'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Teams Leaderboard - Top 4 Only */}
                {activeTab === 'teams' && (
                    <div className="space-y-8">
                        <PodiumDisplay data={leaderboards?.teamLeaderboard?.slice(0, 3)} type="teams" />
                        
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
                                <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-4">
                                    Top 4 Teams
                                </h2>
                                <p className="text-white/80 text-center mt-2">Celebrating the top 4 performing teams</p>
                            </div>
                            <div className="p-6">
                                {leaderboards?.teamLeaderboard?.slice(0, 4).map((team, index) => 
                                    renderTeamRow(team, index)
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Students Leaderboard - Top 4 Only */}
                {activeTab === 'students' && (
                    <div className="space-y-8">
                        <PodiumDisplay data={leaderboards?.overallTopStudents?.slice(0, 3)} type="students" />
                        
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                            <div className="bg-gradient-to-r from-yellow-600 to-amber-400 p-8">
                                <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-4">
                                    Overall Toppers
                                </h2>
                                <p className="text-white/80 text-center mt-2">The top 4 outstanding individual performers</p>
                            </div>
                            <div className="p-6">
                                {leaderboards?.overallTopStudents?.slice(0, 4).map((student, index) => 
                                    renderStudentRow(student, index)
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Categories Leaderboard - Top 4 Only */}
                {activeTab === 'categories' && (
                    <div className="space-y-8">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold text-amber-800 mb-4"> Top 4 by Category</h2>
                            <p className="text-lg text-gray-500">The top 4 performers in each competition category</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {leaderboards?.categoryTopStudents?.map((categoryData, categoryIndex) => (
                                <div key={categoryData.category} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:scale-105 transition-transform duration-300">
                                    <div className={`p-6 ${
                                        categoryIndex % 3 === 0 ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                                        categoryIndex % 3 === 1 ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                                        'bg-gradient-to-r from-orange-500 to-red-500'
                                    }`}>
                                        <h3 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
                                            {categoryData.category}
                                            <span className="text-sm font-normal opacity-90">(Top 4)</span>
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        {categoryData.candidates?.slice(0, 4).map((student, index) => 
                                            renderStudentRow(student, index)
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

               

                {/* Floating decorative elements */}
                <div className="fixed top-20 left-10 w-6 h-6 bg-yellow-400 rounded-full opacity-20 blur-xl pointer-events-none"></div>
                <div className="fixed bottom-20 right-10 w-8 h-8 bg-blue-400 rounded-full opacity-20 blur-xl pointer-events-none"></div>
                <div className="fixed top-1/2 left-1/4 w-4 h-4 bg-purple-400 rounded-full opacity-30 blur-lg pointer-events-none"></div>
            </div>
        </div>
    );
};

export default LeaderboardsPage;