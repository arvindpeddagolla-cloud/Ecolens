import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sparkles, LogOut } from 'lucide-react';
import type { UserProfile } from '../services/mockServices';

interface UserProfilePillProps {
  user: UserProfile;
  onLogout: () => void;
  avatarDropdownOpen: boolean;
  setAvatarDropdownOpen: (open: boolean) => void;
  xpPercent: number;
}

export const UserProfilePill: React.FC<UserProfilePillProps> = ({
  user,
  onLogout,
  avatarDropdownOpen,
  setAvatarDropdownOpen,
  xpPercent
}) => {
  return (
    <div className="hidden md:flex items-center gap-3.5 px-3 py-1.5 rounded-2xl glass-card border-white/5 bg-slate-900/40 select-none">
      {/* Level badge */}
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1 text-xs">
          <Sparkles className="w-3 h-3 text-eco-400" />
          <span className="font-bold text-slate-300">Lvl {user.level}</span>
        </div>
        <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-500" 
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      <div className="h-6 w-[1px] bg-slate-800" />

      {/* Points */}
      <div className="flex items-center gap-1.5 text-sm font-bold text-white">
        <span className="text-eco-400 text-lg">🟢</span>
        <span>{user.greenPoints} <span className="text-slate-400 text-xs font-normal">pts</span></span>
      </div>

      <div className="h-6 w-[1px] bg-slate-800" />

      {/* Avatar */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
          aria-haspopup="true"
          aria-expanded={avatarDropdownOpen}
          aria-label="User profile menu"
          className="w-8 h-8 rounded-xl object-cover border border-white/20 hover:border-eco-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors overflow-hidden"
        >
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-full h-full object-cover"
          />
        </button>
        <AnimatePresence>
          {avatarDropdownOpen && (
            <div className="absolute right-0 top-10 w-48 glass-card border-white/10 rounded-xl p-2 bg-dark-900/90 shadow-xl z-50">
              <div className="px-2.5 py-1.5 border-b border-slate-800/80 mb-1.5 text-left">
                <div className="font-bold text-sm text-white truncate">{user.displayName}</div>
                <div className="text-xs text-slate-400 truncate">{user.email}</div>
              </div>
              <button
                onClick={() => {
                  setAvatarDropdownOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-rose-400 hover:bg-rose-500/10 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default UserProfilePill;
