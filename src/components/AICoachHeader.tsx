import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export const AICoachHeader: React.FC = () => {
  return (
    <div className="border-b border-slate-800/80 p-5 bg-slate-900/30 flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Bot className="w-5.5 h-5.5 text-dark-950 stroke-[2]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>EcoLens AI Advisor</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Real-time coaching module</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-eco-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Active Coaching</span>
      </div>
    </div>
  );
};
export default AICoachHeader;
