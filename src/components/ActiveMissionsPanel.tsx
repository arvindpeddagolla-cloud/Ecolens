import React from 'react';
import { Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import type { Challenge } from '../services/mockServices';

interface ActiveMissionsPanelProps {
  challenges: Challenge[];
  claimingId: string | null;
  handleCompleteChallenge: (id: string) => void;
}

export const ActiveMissionsPanel: React.FC<ActiveMissionsPanelProps> = ({
  challenges,
  claimingId,
  handleCompleteChallenge
}) => {
  return (
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
                  type="button"
                  onClick={() => handleCompleteChallenge(ch.id)}
                  disabled={claimingId !== null}
                  className="glass-btn-primary py-1 px-3 text-[10px] font-bold flex items-center gap-1 shadow-md shadow-emerald-950/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <span>{claimingId === ch.id ? 'Claiming...' : 'Claim Completion'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ActiveMissionsPanel;
