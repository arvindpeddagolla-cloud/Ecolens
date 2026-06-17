import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface EcoScoreDialProps {
  ecoScore: number;
}

export const EcoScoreDial: React.FC<EcoScoreDialProps> = ({ ecoScore }) => {
  const getScoreColor = () => {
    if (ecoScore >= 80) return 'text-emerald-400 stroke-emerald-400';
    if (ecoScore >= 60) return 'text-cyan-400 stroke-cyan-400';
    if (ecoScore >= 40) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  return (
    <div className="lg:col-span-4 glass-card p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden border border-white/5 shadow-xl">
      <div className="absolute -top-10 -left-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl" />
      <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
        <span>Personal Eco Score</span>
        <span title="Based on weekly average logged emissions" className="flex items-center">
          <Info className="w-4 h-4 text-slate-500 cursor-help" />
        </span>
      </h3>

      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* SVG Circle progress ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="88"
            cy="88"
            r="74"
            className="stroke-slate-800 fill-none"
            strokeWidth="10"
          />
          <motion.circle
            cx="88"
            cy="88"
            r="74"
            className={`fill-none ${getScoreColor()}`}
            strokeWidth="10"
            strokeDasharray={464} // circumference: 2 * pi * r => ~464.9
            initial={{ strokeDashoffset: 464 }}
            animate={{ strokeDashoffset: 464 - (464 * ecoScore) / 100 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-5xl font-extrabold tracking-tighter text-white">{ecoScore}</span>
          <span className="text-slate-500 text-sm block font-semibold">/ 100</span>
        </div>
      </div>

      <div className="text-center mt-6">
        <span className="text-sm text-slate-400">Environment Grade: </span>
        <span className={`text-sm font-extrabold ${ecoScore >= 80 ? 'text-emerald-400' : ecoScore >= 60 ? 'text-cyan-400' : ecoScore >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
          {ecoScore === 100 ? 'Excellent 🌿' : ecoScore === 80 ? 'Good 🚲' : ecoScore === 60 ? 'Moderate 🚗' : ecoScore === 40 ? 'High Footprint ⚠️' : 'Critical 🚨'}
        </span>
      </div>
    </div>
  );
};
export default EcoScoreDial;
