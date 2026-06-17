import React from 'react';

interface SimulatorControlsProps {
  baselineWeekly: number;
  setBaselineWeekly: (val: number) => void;
  forecastPeriod: '1month' | '1year' | '5years';
  setForecastPeriod: (period: '1month' | '1year' | '5years') => void;
  selectedScenario: 'current' | 'improved' | 'netzero';
  setSelectedScenario: (scen: 'current' | 'improved' | 'netzero') => void;
  currentFootprint: number;
  improvedFootprint: number;
  netzeroFootprint: number;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  baselineWeekly,
  setBaselineWeekly,
  forecastPeriod,
  setForecastPeriod,
  selectedScenario,
  setSelectedScenario,
  currentFootprint,
  improvedFootprint,
  netzeroFootprint
}) => {
  return (
    <div className="lg:col-span-4 space-y-8 flex flex-col justify-between">
      
      {/* Parameter Slider */}
      <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl space-y-5">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
          <span>WEEKLY BASELINE LOAD</span>
          <span className="text-cyan-400 text-sm">{baselineWeekly} kg CO₂</span>
        </div>
        
        <input
          id="simulator-baseline-input"
          type="range"
          min="10"
          max="350"
          step="5"
          value={baselineWeekly}
          onChange={(e) => setBaselineWeekly(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />

        <div className="flex justify-between text-[9px] text-slate-500 font-bold select-none">
          <span>10 kg (Target Neutrality)</span>
          <span>350 kg (High Carbon Load)</span>
        </div>
      </div>

      {/* Projection timeframe selector */}
      <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl">
        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-3.5">Forecast Time Horizon</span>
        
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: '1month' as const, label: '1 Month' },
            { id: '1year' as const, label: '1 Year' },
            { id: '5years' as const, label: '5 Years' },
          ].map((period) => {
            const isSelected = forecastPeriod === period.id;
            return (
              <button
                key={period.id}
                type="button"
                onClick={() => setForecastPeriod(period.id)}
                className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-500/10 text-white' 
                    : 'border-white/5 bg-slate-900/30 text-slate-500 hover:text-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
              >
                {period.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lifestyle Scenarios Selector */}
      <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl space-y-4">
        <span className="text-[10px] text-slate-400 font-bold uppercase block">Simulation Scenarios</span>

        <div className="space-y-3.5">
          {[
            {
              id: 'current' as const,
              name: 'Current Path',
              desc: 'Keep your current transportation, dietary habits, and baseline energy consumption.',
              carbon: currentFootprint,
              colorClass: 'border-rose-500/20 bg-rose-950/5 text-rose-400 focus:border-rose-500/40',
              activeRing: 'ring-rose-500/40 border-rose-500/60'
            },
            {
              id: 'improved' as const,
              name: 'Improved Lifestyle',
              desc: 'Reduce AC/heating hours, choose green transits, and eat vegetarian lunches (40% savings).',
              carbon: improvedFootprint,
              colorClass: 'border-cyan-500/20 bg-cyan-950/5 text-cyan-400 focus:border-cyan-500/40',
              activeRing: 'ring-cyan-500/40 border-cyan-500/60'
            },
            {
              id: 'netzero' as const,
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
                onClick={() => setSelectedScenario(scenario.id)}
                aria-pressed={isSelected}
                aria-label={`Select scenario ${scenario.name}`}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected 
                    ? `${scenario.colorClass} ring-1 scale-[1.01] border-opacity-100` 
                    : 'border-white/5 bg-slate-900/30 text-slate-400 hover:border-white/10 hover:text-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
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

    </div>
  );
};
export default SimulatorControls;
