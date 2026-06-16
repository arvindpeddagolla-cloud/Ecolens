import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Award, Trophy, Compass, Camera, MessageSquare, Globe, LayoutDashboard, Menu, X, LogOut, Sparkles } from 'lucide-react';
import type { UserProfile } from '../services/mockServices';

interface NavbarProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  isLoggedIn,
  onLogin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'route', label: 'Green Route', icon: Compass },
    { id: 'camera', label: 'Carbon Camera', icon: Camera },
    { id: 'coach', label: 'AI Coach', icon: MessageSquare },
    { id: 'simulator', label: 'Earth Simulator', icon: Globe },
    { id: 'gamification', label: 'Rewards', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setAvatarDropdownOpen(false);
  };

  // Calculate XP Percentage for level bar
  // Each level is 1000 XP for simplicity
  const xpNeededForNextLevel = 1000;
  const currentLevelXp = user.xp % xpNeededForNextLevel;
  const xpPercent = Math.min((currentLevelXp / xpNeededForNextLevel) * 100, 100);

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-white/5 backdrop-blur-glass bg-dark-950/70 py-4 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <button 
          type="button"
          onClick={() => handleTabClick(isLoggedIn ? 'dashboard' : 'landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-xl p-1 text-left"
          aria-label="EcoLens AI Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-dark-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
            EcoLens<span className="text-white font-normal">AI</span>
          </span>
        </button>

        {/* Desktop Tabs */}
        {isLoggedIn && (
          <nav className="hidden lg:flex items-center gap-1" aria-label="Desktop Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none ${
                    isActive 
                      ? 'text-white font-bold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-eco-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* User Pill / Login Button */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {/* User XP & Points Pill (Desktop) */}
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

              {/* Standalone Log Out Button (Desktop) */}
              <button
                onClick={onLogout}
                className="hidden md:flex items-center gap-1.5 px-4.5 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-bold text-xs transition-all select-none hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                className="lg:hidden w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-300 hover:text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="glass-btn-primary px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              Start Tracking
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && isLoggedIn && (
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
        )}
      </AnimatePresence>
    </header>
  );
};
