import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import type { UserProfile } from '../services/mockServices';

interface LevelProgressCardProps {
  user: UserProfile;
  xpPercent: number;
  xpRemaining: number;
  currentLevelXp: number;
  xpNeededForNextLevel: number;
}

export const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  user,
  xpPercent,
  xpRemaining,
  currentLevelXp,
  xpNeededForNextLevel
}) => {
  return (
    <div className="glass-card p-6.5 rounded-3xl border border-white/5 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl" />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Level Circle Badge */}
        <div className="md:col-span-3 flex justify-center">
          <div className="relative w-28 h-28 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-full flex flex-col items-center justify-center border border-white/10 shadow-lg shadow-emerald-950/20">
            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">CURRENT LEVEL</span>
            <span className="text-4xl font-extrabold text-white mt-1">{user.level}</span>
            <Flame className="w-4 h-4 text-emerald-400 absolute bottom-2" />
          </div>
        </div>

        {/* XP Progress Details */}
        <div className="md:col-span-9 space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>LEVEL EXPERIENCE (XP)</span>
            <span className="text-white">{currentLevelXp} / {xpNeededForNextLevel} XP</span>
          </div>

          <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-400 font-medium select-none">
            <span>Gain {xpRemaining} XP to unlock Level {user.level + 1}</span>
            <span className="text-emerald-400 font-semibold">{user.greenPoints} Green Points Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LevelProgressCard;
