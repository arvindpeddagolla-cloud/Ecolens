import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import type { UserProfile } from '../services/mockServices';

interface MobileNavMenuProps {
  isOpen: boolean;
  user: UserProfile;
  activeTab: string;
  navItems: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  handleTabClick: (tabId: string) => void;
  onLogout: () => void;
}

export const MobileNavMenu: React.FC<MobileNavMenuProps> = ({
  isOpen,
  user,
  activeTab,
  navItems,
  handleTabClick,
  onLogout
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="lg:hidden border-t border-slate-800/80 mt-4 overflow-hidden"
    >
      <nav className="py-4 space-y-1.5" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500/10 to-transparent text-white border-l-2 border-eco-500' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-eco-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="h-[1px] bg-slate-800 my-3" />

        {/* Mobile User Profile details */}
        <div className="px-4 py-2 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-xl object-cover" />
            <div>
              <div className="text-sm font-bold text-white">{user.displayName}</div>
              <div className="text-xs text-slate-400">{user.email}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5 mt-3 select-none">
            <div className="glass-card bg-slate-900/20 p-2.5 rounded-xl border border-white/5 flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-bold">LEVEL</span>
              <span className="text-md font-extrabold text-eco-400">{user.level}</span>
            </div>
            <div className="glass-card bg-slate-900/20 p-2.5 rounded-xl border border-white/5 flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-bold">REWARDS</span>
              <span className="text-md font-extrabold text-cyan-400">{user.greenPoints} pts</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-semibold text-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </nav>
    </motion.div>
  );
};
export default MobileNavMenu;
