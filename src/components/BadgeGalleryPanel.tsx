import React from 'react';
import { Award, Trophy } from 'lucide-react';
import type { UserProfile } from '../services/mockServices';
import { ALL_BADGES } from '../services/mockServices';

interface BadgeGalleryPanelProps {
  user: UserProfile;
}

export const BadgeGalleryPanel: React.FC<BadgeGalleryPanelProps> = ({ user }) => {
  return (
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
                <span role="img" aria-label={`${badge.name} badge icon`}>{badge.icon}</span>
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
  );
};
export default BadgeGalleryPanel;
