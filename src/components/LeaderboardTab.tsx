import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';
import { mockFirestore } from '../services/mockServices';

export const LeaderboardTab: React.FC = () => {
  const boardType = 'global';

  const data = mockFirestore.getLeaderboard(boardType);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div aria-label="Rank 1st, Gold Medal" className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-xs shadow-md shadow-amber-950/20">
            🥇
          </div>
        );
      case 2:
        return (
          <div aria-label="Rank 2nd, Silver Medal" className="w-6 h-6 rounded-full bg-slate-400/20 border border-slate-400/30 flex items-center justify-center text-slate-300 font-extrabold text-xs shadow-md shadow-slate-900/20">
            🥈
          </div>
        );
      case 3:
        return (
          <div aria-label="Rank 3rd, Bronze Medal" className="w-6 h-6 rounded-full bg-amber-800/20 border border-amber-800/30 flex items-center justify-center text-amber-600 font-extrabold text-xs shadow-md shadow-amber-950/20">
            🥉
          </div>
        );
      default:
        return (
          <span aria-label={`Rank ${rank}`} className="text-xs text-slate-500 font-bold w-6 text-center block">
            {rank}
          </span>
        );
    }
  };


  return (
    <div className="space-y-8">
      
      {/* Toggles header */}
      <div className="glass-card p-5 rounded-3xl border border-white/5 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Sustainability Standings</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Real-time point indices</span>
        </div>


      </div>

      {/* Leaderboard Table Container */}
      <div className="glass-card rounded-3xl border border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/20 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
                <th scope="col" className="py-4 px-6 w-20">Rank</th>
                <th scope="col" className="py-4 px-6">Entity</th>
                {boardType === 'global' && <th scope="col" className="py-4 px-6">Rating</th>}
                <th scope="col" className="py-4 px-6 text-right w-36">Green Points</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {data.map((row) => {
                  const isCurrentUser = row.name.includes('(You)');

                  return (
                    <motion.tr
                      key={row.name}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35 }}
                      className={`border-b border-slate-800/40 hover:bg-slate-900/20 transition-colors ${
                        isCurrentUser 
                          ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500' 
                          : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6">
                        {getRankBadge(row.rank)}
                      </td>

                      {/* Name / Icon Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {boardType === 'global' ? (
                            <img
                              src={row.avatar}
                              alt={`Avatar of ${row.name}`}
                              className="w-8 h-8 rounded-xl object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl glass-card flex items-center justify-center border border-white/10 bg-slate-950/40 text-sm">
                              <span>{row.avatar}</span>
                            </div>
                          )}
                          <div>
                            <span className={`text-xs font-bold leading-none ${isCurrentUser ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {row.name}
                            </span>
                            {isCurrentUser && (
                              <span className="inline-flex items-center gap-0.5 ml-2 text-[8px] font-extrabold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/10 uppercase tracking-widest animate-pulse">
                                <Sparkles className="w-2 h-2" />
                                <span>Active</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating Column (only for users) */}
                      {boardType === 'global' && (
                        <td className="py-4 px-6">
                          <span className="text-xs font-semibold text-slate-400">
                            {row.score > 3000 
                              ? 'Master 🏆' 
                              : row.score > 1000 
                                ? 'Champion 🌍' 
                                : 'Beginner 🌱'}
                          </span>
                        </td>
                      )}

                      {/* Points Column */}
                      <td className="py-4 px-6 text-right font-extrabold text-white text-xs">
                        {row.score.toLocaleString()} <span className="text-slate-500 text-[9px] font-normal">pts</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
