import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Flame,
  ChevronRight,
  Trophy
} from 'lucide-react';
import type { UserProfile, Challenge } from '../services/mockServices';
import { ALL_BADGES, mockFirestore } from '../services/mockServices';

interface GamificationTabProps {
  user: UserProfile;
  challenges: Challenge[];
  onChallengeCompleted: () => void;
}

export const GamificationTab: React.FC<GamificationTabProps> = ({ 
  user, 
  challenges,
  onChallengeCompleted 
}) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Trigger confetti burst on completion
  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#3b82f6', '#ffffff']
    });
  };

  const handleCompleteChallenge = (id: string) => {
    setClaimingId(id);
    
    // Simulate minor progress delay for feel
    setTimeout(() => {
      mockFirestore.completeChallenge(id);
      triggerConfetti();
      setClaimingId(null);
      onChallengeCompleted();
    }, 800);
  };

  // Calculate XP progress bar parameters
  const xpNeededForNextLevel = 1000;
  const currentLevelXp = user.xp % xpNeededForNextLevel;
  const xpRemaining = xpNeededForNextLevel - currentLevelXp;
  const xpPercent = Math.min((currentLevelXp / xpNeededForNextLevel) * 100, 100);

  return (
    <div className="space-y-8">
      
      {/* Level and XP HUD Card */}
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

      {/* Challenges & Badges Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Challenges Panel */}
        <div className="lg:col-span-7 glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Active Missions</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Points multiplier active</span>
          </div>

          <div className="space-y-4">
            {challenges.map((ch) => (
              <div 
                key={ch.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  ch.completed 
                    ? 'border-emerald-500/20 bg-emerald-950/5' 
                    : 'border-white/5 bg-slate-900/30'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-200 leading-snug">{ch.title}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        ch.category === 'daily'
                          ? 'text-cyan-400 bg-cyan-950/20 border-cyan-500/20'
                          : 'text-amber-400 bg-amber-950/20 border-amber-500/20'
                      }`}>
                        {ch.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {ch.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-cyan-400">+{ch.points} GP</span>
                    <span className="text-[9px] text-slate-500 font-bold block">+{ch.xp} XP</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-slate-800/60">
                  <div className="flex-grow max-w-[65%] flex items-center gap-2">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${ch.progress}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap">{ch.progress}%</span>
                  </div>

                  {ch.completed ? (
                    <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Completed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCompleteChallenge(ch.id)}
                      disabled={claimingId !== null}
                      className="glass-btn-primary py-1 px-3 text-[10px] font-bold flex items-center gap-1 shadow-md shadow-emerald-950/10"
                    >
                      <span>{claimingId === ch.id ? 'Claiming...' : 'Claim Completion'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Badges Showcase */}
        <div className="lg:col-span-5 glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Badge Gallery</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{user.badges.length} Unlocked</span>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 gap-4">
            {ALL_BADGES.map((badge) => {
              const isUnlocked = user.badges.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`p-4.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-between ${
                    isUnlocked
                      ? 'border-emerald-500/20 bg-emerald-950/5 shadow-md shadow-emerald-950/10'
                      : 'border-white/5 bg-slate-900/30 opacity-45'
                  }`}
                >
                  <div className="relative w-14 h-14 rounded-xl glass-card flex items-center justify-center border border-white/5 mb-3 bg-slate-950/40 text-3xl select-none">
                    <span>{badge.icon}</span>
                    {isUnlocked && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center border border-slate-900 text-[8px] font-extrabold text-slate-900">
                        ✓
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-[10px] text-white font-bold block truncate max-w-[120px]">
                      {badge.name.replace(/^[^\s]+\s/, '')}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-1 font-bold">
                      {isUnlocked ? 'Unlocked' : `Requires ${badge.xpRequired} XP`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/30 text-[10px] text-slate-400 leading-relaxed">
            <div className="flex items-start gap-2">
              <Trophy className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>How to unlock</strong>: Earn experience (XP) by logging emissions, optimizing transit routes, and completing daily active missions. Badge triggers calculate instantly.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
