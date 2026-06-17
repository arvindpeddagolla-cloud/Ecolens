import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Award, Trophy, Compass, Camera, MessageSquare, Globe, LayoutDashboard, Menu, X, LogOut } from 'lucide-react';
import type { UserProfile } from '../services/mockServices';
import { UserProfilePill } from './UserProfilePill';
import { MobileNavMenu } from './MobileNavMenu';

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
              <UserProfilePill
                user={user}
                onLogout={onLogout}
                avatarDropdownOpen={avatarDropdownOpen}
                setAvatarDropdownOpen={setAvatarDropdownOpen}
                xpPercent={xpPercent}
              />

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
        <MobileNavMenu
          isOpen={mobileMenuOpen && isLoggedIn}
          user={user}
          activeTab={activeTab}
          navItems={navItems}
          handleTabClick={handleTabClick}
          onLogout={onLogout}
        />
      </AnimatePresence>
    </header>
  );
};
export default Navbar;
