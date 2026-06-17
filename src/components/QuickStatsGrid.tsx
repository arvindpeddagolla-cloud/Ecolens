import React from 'react';
import { TrendingDown } from 'lucide-react';

interface QuickStatsGridProps {
  totalEmissionsRound: number;
  treesNeeded: number;
  dailyRound: number;
  weeklyRound: number;
  monthlyRound: number;
  yearlyRound: number;
}

export const QuickStatsGrid: React.FC<QuickStatsGridProps> = ({
  totalEmissionsRound,
  treesNeeded,
  dailyRound,
  weeklyRound,
  monthlyRound,
  yearlyRound
}) => {
  return (
    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      
      <div role="status" aria-label="Total carbon logged stats" className="glass-card p-6.5 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
        <div>
          <span className="text-xs text-slate-400 font-bold block mb-1">TOTAL CARBON LOGGED</span>
          <span className="text-4xl font-extrabold text-white">{totalEmissionsRound}</span>
          <span className="text-sm text-slate-400 ml-1">kg CO₂</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-400 mt-4">
          <TrendingDown className="w-4 h-4" />
          <span>-12.4% baseline reduction</span>
        </div>
      </div>

      <div role="status" aria-label="Tree offset equivalent stats" className="glass-card p-6.5 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
        <div>
          <span className="text-xs text-slate-400 font-bold block mb-1">OFFSET EQUIVALENT</span>
          <span className="text-4xl font-extrabold text-emerald-400">{treesNeeded}</span>
          <span className="text-sm text-slate-400 ml-1">trees</span>
        </div>
        <div className="text-xs text-slate-400 mt-4 leading-snug">
          Annual growth needed to absorb your logged footprint.
        </div>
      </div>

      <div role="status" aria-label="Carbon saved stats" className="glass-card p-6.5 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
        <div>
          <span className="text-xs text-slate-400 font-bold block mb-1">CARBON SAVED</span>
          <span className="text-4xl font-extrabold text-cyan-400">18.5</span>
          <span className="text-sm text-slate-400 ml-1">kg CO₂</span>
        </div>
        <div className="text-xs text-slate-300 mt-4">
          Through green commutes and smart meals logged this week.
        </div>
      </div>

      <div role="status" aria-label="Carbon footprint intervals" className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
        <div>
          <span className="text-xs text-slate-400 font-bold block mb-2">FOOTPRINT BY INTERVAL</span>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-slate-900/40 p-2 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-500 block font-bold">DAILY</span>
              <span className="text-xs font-extrabold text-white">{dailyRound} <span className="text-[8px] text-slate-400 font-normal">kg</span></span>
            </div>
            <div className="bg-slate-900/40 p-2 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-500 block font-bold">WEEKLY</span>
              <span className="text-xs font-extrabold text-white">{weeklyRound} <span className="text-[8px] text-slate-400 font-normal">kg</span></span>
            </div>
            <div className="bg-slate-900/40 p-2 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-500 block font-bold">MONTHLY</span>
              <span className="text-xs font-extrabold text-white">{monthlyRound} <span className="text-[8px] text-slate-400 font-normal">kg</span></span>
            </div>
            <div className="bg-slate-900/40 p-2 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-500 block font-bold">YEARLY</span>
              <span className="text-xs font-extrabold text-white">{yearlyRound} <span className="text-[8px] text-slate-400 font-normal">kg</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default QuickStatsGrid;
