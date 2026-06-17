import React from 'react';
import { 
  Car, 
  Bus, 
  Train, 
  Bike, 
  Footprints, 
  Check, 
  TrendingDown, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import type { RouteOption } from '../services/mockServices';

export interface CustomRouteOption extends RouteOption {
  distance: string;
}

interface RouteComparisonPanelProps {
  routes: CustomRouteOption[];
  selectedMode: 'car' | 'bus' | 'train' | 'motorcycle' | 'bike' | 'walking';
  setSelectedMode: (mode: 'car' | 'bus' | 'train' | 'motorcycle' | 'bike' | 'walking') => void;
  selectedRoute: CustomRouteOption | undefined;
  isLogging: boolean;
  loggedAlert: boolean;
  handleLogGreenTrip: () => void;
  recommendationText: string;
}

export const RouteComparisonPanel: React.FC<RouteComparisonPanelProps> = ({
  routes,
  selectedMode,
  setSelectedMode,
  selectedRoute,
  isLogging,
  loggedAlert,
  handleLogGreenTrip,
  recommendationText
}) => {
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'car': return Car;
      case 'bus': return Bus;
      case 'train': return Train;
      case 'bike': return Bike;
      default: return Footprints;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'car': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'bus': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'train': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'bike': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* List of Route Commutes */}
      <div className="lg:col-span-5 space-y-4">
        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Transit Commutes Compared</span>
        
        <div className="space-y-3">
          {routes.map((route) => {
            const isSelected = selectedMode === route.mode;
            const Icon = getModeIcon(route.mode);
            const colorClasses = getModeColor(route.mode);
            
            return (
              <button
                key={route.mode}
                type="button"
                onClick={() => setSelectedMode(route.mode)}
                aria-pressed={isSelected}
                aria-label={`Select transit mode ${route.mode}`}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500/20 scale-[1.01]' 
                    : 'border-white/5 bg-slate-900/30 text-slate-400 hover:border-white/10 hover:text-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorClasses}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-white capitalize block">
                      {route.mode} Mode
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">
                      Est: {route.duration} • Cost: {route.cost}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-extrabold ${route.emissions === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {route.emissions} kg
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">CO₂ Footprint</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Mode Summary and Recommendations */}
      <div className="lg:col-span-7 space-y-8">
        {selectedRoute && (
          <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl space-y-6">
            
            <div className="flex justify-between items-start border-b border-slate-800/80 pb-5">
              <div>
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-0.5 rounded-full inline-block mb-2 select-none">
                  Commute Selected
                </span>
                <h4 className="text-lg font-bold text-white capitalize">
                  {selectedRoute.mode} commute journey
                </h4>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                  Distance: {selectedRoute.distance} • Time: {selectedRoute.duration}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-extrabold text-rose-400 block leading-tight">
                  +{selectedRoute.emissions} kg
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                  CO₂ Footprint
                </span>
              </div>
            </div>

            {/* Savings HUD */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-white/5 flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingDown className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block font-bold leading-none mb-1">CARBON SAVED</span>
                  <span className="text-xs font-extrabold text-emerald-400 leading-none">{selectedRoute.savings} kg CO₂</span>
                </div>
              </div>

              <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-white/5 flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block font-bold leading-none mb-1">GP POINTS</span>
                  <span className="text-xs font-extrabold text-cyan-400 leading-none">+{Math.round(selectedRoute.savings * 3)} GP</span>
                </div>
              </div>
            </div>

            {/* AI Advisor Panel */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
              <div className="flex gap-2">
                <Sparkles className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-emerald-400 font-extrabold uppercase block tracking-wider mb-1">AI Route Optimizer Advice</span>
                  <p 
                    className="text-[10px] text-slate-300 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{ __html: recommendationText }}
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <button
              type="button"
              onClick={handleLogGreenTrip}
              disabled={isLogging}
              className="glass-btn-primary w-full py-3 text-xs font-extrabold flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {isLogging ? (
                <span>Logging Trip...</span>
              ) : loggedAlert ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Logged Successfully!</span>
                </>
              ) : (
                <>
                  <span>Log this commute to dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
        )}
      </div>

    </div>
  );
};
export default RouteComparisonPanel;
