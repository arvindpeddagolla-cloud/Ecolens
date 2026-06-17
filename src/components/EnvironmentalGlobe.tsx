import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Wind, Trees, Droplet, Bird } from 'lucide-react';

interface EnvironmentalGlobeProps {
  equivalentWeekly: number;
  forecastPeriod: '1month' | '1year' | '5years';
  selectedScenario: 'current' | 'improved' | 'netzero';
  currentFootprint: number;
  improvedFootprint: number;
  netzeroFootprint: number;
}

export const EnvironmentalGlobe: React.FC<EnvironmentalGlobeProps> = ({
  equivalentWeekly,
  forecastPeriod,
  selectedScenario,
  currentFootprint,
  improvedFootprint,
  netzeroFootprint
}) => {
  const getEnvStatus = () => {
    if (equivalentWeekly < 30) {
      return { label: 'Pristine Biosphere 🌸', color: 'text-emerald-400', theme: 'clean' };
    }
    if (equivalentWeekly <= 100) {
      return { label: 'Stressed Environment ⚠️', color: 'text-cyan-400', theme: 'moderate' };
    }
    return { label: 'Ecological Collapse 🚨', color: 'text-rose-400', theme: 'polluted' };
  };

  const status = getEnvStatus();

  const periodLabels = {
    '1month': '1 Month',
    '1year': '1 Year',
    '5years': '5 Years'
  };

  // Environmental health score: 0 to 100
  const envHealthScore = Math.max(10, Math.min(100, Math.round(100 - (equivalentWeekly / 250) * 85)));

  // Trees count: 0 kg weekly => 12 trees, 250 kg weekly => 0 trees
  const treeCount = Math.max(0, Math.round((250 - equivalentWeekly) / 20));
  
  // Air haze opacity: 0 kg => 0, 250 kg => 0.85
  const hazeOpacity = Math.min(0.85, equivalentWeekly / 280);

  // River color shift: potable blue, treated teal, polluted gray, toxic brown
  const getRiverColor = () => {
    if (equivalentWeekly < 30) return '#06b6d4'; // cyan-500
    if (equivalentWeekly <= 100) return '#14b8a6'; // teal-500
    if (equivalentWeekly <= 180) return '#64748b'; // slate-500
    return '#451a03'; // brown-900 (muddy)
  };

  // Wildlife count: 0 kg => 6, 250 kg => 0
  const wildlifeCount = Math.max(0, Math.round((250 - equivalentWeekly) / 40));

  return (
    <div className="lg:col-span-8 glass-card p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col justify-between min-h-[480px] relative overflow-hidden bg-slate-950/20">
      
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Pollution smog haze overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out bg-orange-950/20"
        style={{ 
          opacity: hazeOpacity,
          backdropFilter: `blur(${hazeOpacity * 4}px)`,
          background: `radial-gradient(circle, rgba(120, 110, 90, ${hazeOpacity}) 0%, rgba(20, 15, 10, ${hazeOpacity * 1.2}) 100%)`
        }}
      />

      {/* Environmental parameters HUD */}
      <div className="flex justify-between items-center z-10 select-none">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selected Projection State</span>
          <span className={`text-md font-extrabold transition-colors duration-500 ${status.color}`}>
            {status.label}
          </span>
        </div>
        
        <div className="text-right">
          <span className="text-2xl font-extrabold text-white">
            {selectedScenario === 'current' 
              ? Math.round(currentFootprint) 
              : selectedScenario === 'improved' 
                ? Math.round(improvedFootprint) 
                : Math.round(netzeroFootprint)}
          </span>
          <span className="text-slate-400 text-xs ml-1 font-bold">kg CO₂</span>
          <span className="text-[9px] text-slate-500 font-bold block">simulated {periodLabels[forecastPeriod]} load</span>
        </div>
      </div>

      {/* Vector Biosphere Illustration Area */}
      <div className="flex-grow flex items-center justify-center py-8 relative">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          
          {/* Spinning Atmosphere Globe */}
          <div 
            className="absolute inset-0 rounded-full border border-dashed transition-all duration-1000"
            style={{
              borderColor: equivalentWeekly > 100 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.2)',
              transform: 'rotate(15deg)',
              boxShadow: equivalentWeekly > 100 
                ? '0 0 40px rgba(239, 68, 68, 0.1), inset 0 0 20px rgba(239, 68, 68, 0.1)' 
                : '0 0 50px rgba(6, 182, 212, 0.25), inset 0 0 30px rgba(16, 185, 129, 0.2)'
            }}
          />

          {/* The Globe Core */}
          <div 
            className="absolute inset-4 rounded-full bg-slate-900 border transition-colors duration-1000 overflow-hidden"
            style={{
              borderColor: equivalentWeekly > 100 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <path d="M15 45 C25 35, 45 40, 50 50 C55 60, 40 75, 25 70 Z" fill={equivalentWeekly > 100 ? '#3f3f46' : '#15803d'} className="transition-colors duration-1000" />
              <path d="M60 25 C75 20, 85 35, 80 50 C75 65, 55 60, 55 40 Z" fill={equivalentWeekly > 100 ? '#27272a' : '#166534'} className="transition-colors duration-1000" />
              
              {/* River flowing across Globe */}
              <motion.path
                d="M 0 50 Q 35 30, 50 65 T 100 50"
                fill="none"
                stroke={getRiverColor()}
                strokeWidth="4"
                className="transition-colors duration-1000"
              />
              
              {/* Flowing river dashes */}
              {equivalentWeekly < 180 && (
                <motion.path
                  d="M 0 50 Q 35 30, 50 65 T 100 50"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  opacity="0.3"
                  strokeDasharray="5, 20"
                  animate={{ strokeDashoffset: -100 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </svg>
          </div>

          {/* Dynamic Sprouting Trees */}
          <div className="absolute inset-0 pointer-events-none select-none">
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (idx / 12) * Math.PI * 2;
              const radius = 110;
              const x = Math.cos(angle) * radius + 150;
              const y = Math.sin(angle) * radius + 150;
              
              const isVisible = idx < treeCount;
              
              return (
                <div
                  key={idx}
                  className="absolute w-6 h-6 flex items-center justify-center transition-all duration-1000 ease-in-out"
                  style={{
                    left: `${(x / 300) * 100}%`,
                    top: `${(y / 300) * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${angle * (180 / Math.PI) + 90}deg) scale(${isVisible ? 1 : 0})`,
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  <span className="text-md select-none">{idx % 2 === 0 ? '🌲' : '🌳'}</span>
                </div>
              );
            })}
          </div>

          {/* Floating Wildlife Birds */}
          <div className="absolute inset-0 pointer-events-none select-none">
            {Array.from({ length: 6 }).map((_, idx) => {
              const isVisible = idx < wildlifeCount;
              
              return (
                <div
                  key={idx}
                  className="absolute transition-all duration-1000 ease-in-out"
                  style={{
                    left: `${20 + idx * 12}%`,
                    top: `${15 + (idx % 2) * 10}%`,
                    transform: `scale(${isVisible ? 1 : 0})`,
                    opacity: isVisible ? 0.75 : 0,
                  }}
                >
                  <Bird className="w-4.5 h-4.5 text-sky-400 fill-sky-500/20" />
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Vital Signs metrics footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 z-10 select-none">
        
        <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 flex items-center gap-2.5">
          <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center border border-white/5 ${envHealthScore >= 70 ? 'text-emerald-400 bg-emerald-500/10' : envHealthScore >= 40 ? 'text-cyan-400 bg-cyan-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block font-bold leading-none mb-1">HEALTH INDEX</span>
            <span className="text-xs font-extrabold text-white leading-none">{envHealthScore}%</span>
          </div>
        </div>

        <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 flex items-center gap-2.5">
          <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center border border-white/5 ${equivalentWeekly > 120 ? 'text-rose-400 bg-rose-500/10' : 'text-cyan-400 bg-cyan-500/10'}`}>
            <Wind className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block font-bold leading-none mb-1">AIR HAZE</span>
            <span className="text-xs font-extrabold text-white leading-none">{(hazeOpacity * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center border border-white/5 text-emerald-400 bg-emerald-500/10">
            <Trees className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block font-bold leading-none mb-1">FORESTation</span>
            <span className="text-xs font-extrabold text-white leading-none">{treeCount} / 12 units</span>
          </div>
        </div>

        <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 flex items-center gap-2.5">
          <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center border border-white/5 ${equivalentWeekly < 30 ? 'text-cyan-400 bg-cyan-500/10' : equivalentWeekly <= 100 ? 'text-teal-400 bg-teal-500/10' : 'text-amber-600 bg-amber-500/10'}`}>
            <Droplet className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block font-bold leading-none mb-1">RIVER CLARITY</span>
            <span className="text-xs font-extrabold text-white leading-none">{equivalentWeekly < 30 ? 'Drinkable' : equivalentWeekly <= 100 ? 'Potable' : equivalentWeekly <= 180 ? 'Turbid' : 'Toxic'}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
export default EnvironmentalGlobe;
