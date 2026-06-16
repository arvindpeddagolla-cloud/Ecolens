import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, ShieldAlert, Wind, Trees, Droplet, Bird, RefreshCw } from 'lucide-react';
import type { EmissionsLog } from '../services/mockServices';

interface EarthSimulatorTabProps {
  logs: EmissionsLog[];
}

export const EarthSimulatorTab: React.FC<EarthSimulatorTabProps> = ({ logs }) => {
  // Compute user actual weekly carbon footprint as initial state
  const actualEmissions = logs.reduce((acc, curr) => acc + curr.co2Emissions, 0);
  const roundedActual = Math.round(actualEmissions) || 100; // fallback to 100 if no logs

  // Baseline weekly emissions (adjustable by slider)
  const [baselineWeekly, setBaselineWeekly] = useState(roundedActual);
  
  // Forecast period state: '1month' | '1year' | '5years'
  const [forecastPeriod, setForecastPeriod] = useState<'1month' | '1year' | '5years'>('1year');

  // Selected lifestyle scenario state: 'current' | 'improved' | 'netzero'
  const [selectedScenario, setSelectedScenario] = useState<'current' | 'improved' | 'netzero'>('current');

  // If logs change, sync the initial slider value
  useEffect(() => {
    if (roundedActual > 0) {
      setBaselineWeekly(roundedActual);
    }
  }, [roundedActual]);

  const handleResetToActual = () => {
    setBaselineWeekly(roundedActual);
  };

  // Scenario configuration and computations
  const periodMultipliers = {
    '1month': 4.33,
    '1year': 52,
    '5years': 260
  };

  const periodLabels = {
    '1month': '1 Month',
    '1year': '1 Year',
    '5years': '5 Years'
  };

  const multiplier = periodMultipliers[forecastPeriod];

  // Calculate carbon footprints for each scenario
  const currentFootprint = baselineWeekly * multiplier;
  const improvedFootprint = baselineWeekly * 0.6 * multiplier;
  const netzeroFootprint = baselineWeekly * 0.05 * multiplier;

  // Determine equivalent weekly emissions based on selected scenario to drive indicators
  let equivalentWeekly = baselineWeekly;
  if (selectedScenario === 'improved') {
    equivalentWeekly = baselineWeekly * 0.6;
  } else if (selectedScenario === 'netzero') {
    equivalentWeekly = baselineWeekly * 0.05;
  }

  // Environmental indicator ratings based on equivalent weekly emissions
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
    <div className="space-y-8">
      
      {/* Simulation Header */}
      <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-eco-400" />
            <span>Earth Impact Simulator</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Model your future carbon emissions. Adjust weekly baseline emissions using the slider, select forecast periods, and switch between lifestyle scenarios to view Earth's vital signs.
          </p>
        </div>

        <button
          onClick={handleResetToActual}
          className="glass-btn-secondary py-2.5 px-4.5 text-xs font-bold flex items-center gap-1.5 border border-white/10 hover:bg-slate-800/60"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync to Actual Logs ({roundedActual} kg)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Interactive Earth Simulator Screen */}
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
                  const driftDelay = idx * 1.5;
                  
                  return (
                    <div
                      key={idx}
                      className="absolute transition-all duration-1000 ease-in-out"
                      style={{
                        left: `${20 + idx * 12}%`,
                        top: `${15 + (idx % 2) * 10}%`,
                        transform: `scale(${isVisible ? 1 : 0})`,
                        opacity: isVisible ? 0.45 : 0,
                      }}
                    >
                      <span className="text-xs select-none animate-bounce" style={{ animationDelay: `${driftDelay}s`, animationDuration: '3.5s' }}>
                        🕊️
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Heavy Smog clouds for high emissions */}
              <div className="absolute inset-0 pointer-events-none select-none">
                {equivalentWeekly > 100 && (
                  <div className="absolute top-10 left-12 bg-slate-800/45 w-20 h-7 rounded-full blur-sm animate-pulse" style={{ animationDuration: '6s' }} />
                )}
                {equivalentWeekly > 160 && (
                  <div className="absolute bottom-12 right-12 bg-zinc-800/50 w-24 h-8 rounded-full blur-md animate-pulse" style={{ animationDuration: '8s' }} />
                )}
              </div>

            </div>
          </div>

          {/* Environmental metrics dashboard at the bottom */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-900 z-10 select-none">
            <div className="flex items-center gap-2">
              <Trees className={`w-4 h-4 ${equivalentWeekly > 100 ? 'text-slate-500' : 'text-emerald-400'}`} />
              <div className="text-[10px] leading-tight">
                <span className="text-slate-400 block font-bold">FOREST HEALTH</span>
                <span className="text-white font-extrabold">
                  {equivalentWeekly > 160 ? '24% Canopy' : equivalentWeekly > 60 ? '65% Canopy' : '92% Canopy'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Wind className={`w-4 h-4 ${equivalentWeekly > 100 ? 'text-slate-500' : 'text-cyan-400'}`} />
              <div className="text-[10px] leading-tight">
                <span className="text-slate-400 block font-bold">AIR INDEX</span>
                <span className="text-white font-extrabold">
                  {equivalentWeekly > 180 ? 'AQI 320' : equivalentWeekly > 80 ? 'AQI 140' : 'AQI 12'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Droplet className={`w-4 h-4 ${equivalentWeekly > 100 ? 'text-slate-500' : 'text-blue-400'}`} />
              <div className="text-[10px] leading-tight">
                <span className="text-slate-400 block font-bold">WATER PURITY</span>
                <span className="text-white font-extrabold">
                  {equivalentWeekly > 160 ? '32% Purity' : equivalentWeekly > 60 ? '74% Purity' : '98% Purity'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Bird className={`w-4 h-4 ${equivalentWeekly > 100 ? 'text-slate-500' : 'text-emerald-400'}`} />
              <div className="text-[10px] leading-tight">
                <span className="text-slate-400 block font-bold">HEALTH SCORE</span>
                <span className="text-white font-extrabold">{envHealthScore} / 100</span>
              </div>
            </div>
          </div>

        </div>

        {/* Projection controls right panel */}
        <div className="lg:col-span-4 glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl flex flex-col justify-between h-full space-y-6">
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-white">Projection Controller</h4>
            
            {/* Forecast period select */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Forecast Period</label>
              <div className="flex p-0.5 rounded-lg bg-slate-900 border border-white/5 text-xs select-none">
                {(['1month', '1year', '5years'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setForecastPeriod(period)}
                    className={`flex-1 px-2.5 py-1.5 rounded-md font-semibold transition-all text-center ${
                      forecastPeriod === period ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {periodLabels[period]}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Component to adjust baseline */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2">
                <span>WEEKLY BASELINE LOAD</span>
                <span className="text-white">{baselineWeekly} kg CO₂</span>
              </div>
              
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={baselineWeekly}
                onChange={(e) => setBaselineWeekly(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-eco-400 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold mt-1.5">
                <span>10 kg</span>
                <span>120 kg (Avg)</span>
                <span>250 kg</span>
              </div>
            </div>

            {/* Lifestyle Preset Scenarios */}
            <div className="space-y-3.5 pt-4 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Lifestyle Scenarios</span>
              
              {[
                {
                  id: 'current',
                  name: 'Current Lifestyle',
                  desc: 'Continue with your current logging footprint without behavioral change.',
                  carbon: currentFootprint,
                  colorClass: 'border-rose-500/20 bg-rose-950/5 text-rose-400 focus:border-rose-500/40',
                  activeRing: 'ring-rose-500/40 border-rose-500/60'
                },
                {
                  id: 'improved',
                  name: 'Improved Lifestyle',
                  desc: 'Reduce AC/heating hours, choose green transits, and eat vegetarian lunches (40% savings).',
                  carbon: improvedFootprint,
                  colorClass: 'border-cyan-500/20 bg-cyan-950/5 text-cyan-400 focus:border-cyan-500/40',
                  activeRing: 'ring-cyan-500/40 border-cyan-500/60'
                },
                {
                  id: 'netzero',
                  name: 'Net-Zero Lifestyle',
                  desc: 'Swap entirely to cycling, solar battery offsetting, and a clean organic plant-based diet (95% savings).',
                  carbon: netzeroFootprint,
                  colorClass: 'border-emerald-500/20 bg-emerald-950/5 text-emerald-400 focus:border-emerald-500/40',
                  activeRing: 'ring-emerald-500/40 border-emerald-500/60'
                }
              ].map((scenario) => {
                const isSelected = selectedScenario === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setSelectedScenario(scenario.id as any)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected 
                        ? `${scenario.colorClass} ring-1 scale-[1.01] border-opacity-100` 
                        : 'border-white/5 bg-slate-900/30 text-slate-400 hover:border-white/10 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-extrabold text-white">{scenario.name}</span>
                      <span className="text-[10px] font-extrabold bg-slate-900 px-2 py-0.5 rounded-md text-slate-300">
                        {Math.round(scenario.carbon)} kg
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-medium">
                      {scenario.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 text-[10px] text-slate-400 leading-normal flex items-start gap-2.5 bg-slate-900/45 p-3 rounded-2xl">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Scientific Simulator</strong>: Changing scenarios calculates cumulative environmental outcomes. Net-zero limits temperature and forest decay.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
