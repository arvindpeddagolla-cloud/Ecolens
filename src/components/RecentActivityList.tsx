import React from 'react';
import { 
  Car, 
  Lightbulb, 
  Apple, 
  ShoppingBag, 
  Trash2 
} from 'lucide-react';
import type { EmissionsLog } from '../services/mockServices';
import { 
  mockFirestore, 
  TRAVEL_FACTORS, 
  ELECTRICITY_FACTOR, 
  FOOD_FACTORS, 
  SHOPPING_FACTORS 
} from '../services/mockServices';

interface RecentActivityListProps {
  logs: EmissionsLog[];
  onLogDeleted: () => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  logs,
  onLogDeleted
}) => {
  const getLogFormula = (log: EmissionsLog) => {
    let factor = 0;
    let factorLabel = '';
    if (log.category === 'travel') {
      factor = TRAVEL_FACTORS[log.subCategory as keyof typeof TRAVEL_FACTORS] || 0;
      factorLabel = 'kg/km';
    } else if (log.category === 'energy') {
      factor = ELECTRICITY_FACTOR;
      factorLabel = 'kg/kWh';
    } else if (log.category === 'food') {
      factor = FOOD_FACTORS[log.subCategory as keyof typeof FOOD_FACTORS] || 0;
      factorLabel = 'kg/meal';
    } else if (log.category === 'shopping') {
      factor = SHOPPING_FACTORS[log.subCategory as keyof typeof SHOPPING_FACTORS] || 0;
      factorLabel = 'kg/item';
    }
    return `${log.amount} ${log.unit} × ${factor} ${factorLabel}`;
  };

  const handleDeleteLog = (id: string) => {
    mockFirestore.deleteLog(id);
    onLogDeleted();
  };

  return (
    <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl flex flex-col justify-between">
      <div>
        <h3 className="text-md font-bold text-white mb-4">Recent Carbon Activity</h3>
        
        <div className="max-h-60 overflow-y-auto space-y-3.5 pr-1.5">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No emissions logged yet. Start today!
            </div>
          ) : (
            logs.map((log) => {
              let CatIcon = Car;
              let catColor = 'text-cyan-400';
              if (log.category === 'energy') { CatIcon = Lightbulb; catColor = 'text-amber-400'; }
              if (log.category === 'food') { CatIcon = Apple; catColor = 'text-emerald-400'; }
              if (log.category === 'shopping') { CatIcon = ShoppingBag; catColor = 'text-purple-400'; }
              
              return (
                <article 
                  key={log.id} 
                  aria-label={`Log: ${log.description}`}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8.5 h-8.5 rounded-lg glass-card flex items-center justify-center border border-white/5`}>
                      <CatIcon className={`w-4.5 h-4.5 ${catColor}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 leading-snug truncate max-w-[150px] md:max-w-[250px]" title={log.description}>
                        {log.description}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold flex flex-col gap-0.5 mt-0.5">
                        <span>{log.amount} {log.unit} • {log.date}</span>
                        <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 w-fit">
                          Formula: {getLogFormula(log)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-400">+{log.co2Emissions}</span>
                      <span className="text-[9px] text-slate-500 font-bold block">kg CO₂</span>
                    </div>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      aria-label={`Delete log ${log.description}`}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default RecentActivityList;
