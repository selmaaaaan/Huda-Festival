import React from 'react';

const LeaderboardTable = ({ data, startingRank = 1, compact = false }) => {
  return (
    <div className="w-full">
      {/* Editorial Table Header */}
      <div className={`hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b-2 border-[var(--border)] font-bold text-xs uppercase tracking-widest text-gray-500 ${compact ? 'hidden md:hidden' : ''}`}>
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-8">Team</div>
        <div className="col-span-3 text-right">Points</div>
      </div>

      <div className="divide-y-2 divide-[var(--border)]">
        {data && data.length > 0 ? (
          data.map((team, index) => {
            const rank = startingRank + index;
            return (
              <div key={team._id || index} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-2 md:col-span-1 text-center font-display font-black text-xl text-gray-400">
                  {rank.toString().padStart(2, '0')}
                </div>
                <div className="col-span-7 md:col-span-8 font-bold text-lg md:text-xl uppercase flex items-center gap-3">
                  {/* Subtle team color dot */}
                  <span className="w-3 h-3 rounded-full hidden sm:block border border-[var(--border)]" style={{ backgroundColor: team.color || 'var(--festival-black)' }} />
                  {team.name}
                </div>
                <div className="col-span-3 md:col-span-3 text-right font-black font-display text-xl md:text-2xl text-[var(--festival-black)]">
                  {team.totalPoints}
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-6 py-12 text-center flex flex-col items-center">
            <span className="text-4xl text-gray-300 mb-2">👀</span>
            <p className="font-bold uppercase tracking-widest text-sm text-gray-500">No data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTable;