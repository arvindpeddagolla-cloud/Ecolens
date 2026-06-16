import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  MapPin, 
  ArrowRight, 
  Car, 
  Bus, 
  Train, 
  Bike, 
  Footprints, 
  Check,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import type { RouteOption } from '../services/mockServices';
import { mockFirestore } from '../services/mockServices';

interface GreenRouteTabProps {
  onLogAdded: () => void;
}

interface CustomRouteOption extends RouteOption {
  distance: string;
}

export const GreenRouteTab: React.FC<GreenRouteTabProps> = ({ onLogAdded }) => {
  const [source, setSource] = useState('Central District');
  const [destination, setDestination] = useState('Green Lake Park');
  const [distance, setDistance] = useState<number | ''>(15);
  const [routes, setRoutes] = useState<CustomRouteOption[]>([]);
  const [selectedMode, setSelectedMode] = useState<'car' | 'bus' | 'train' | 'motorcycle' | 'bike' | 'walking'>('bike');
  const [isCalculated, setIsCalculated] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [loggedAlert, setLoggedAlert] = useState(false);

  const calculateRouteOptions = (dist: number): CustomRouteOption[] => {
    const carEmissions = dist * 0.192;
    
    const modes: ('car' | 'bus' | 'train' | 'motorcycle' | 'bike' | 'walking')[] = [
      'car', 'bus', 'train', 'motorcycle', 'bike', 'walking'
    ];
    
    const speedMap = { car: 60, bus: 40, train: 90, motorcycle: 55, bike: 15, walking: 5 };
    const costMap = {
      car: dist * 0.18,
      bus: 2.25 + dist * 0.04,
      train: 4.50 + dist * 0.06,
      motorcycle: dist * 0.08,
      bike: 0,
      walking: 0
    };
    const factorMap = { car: 0.192, bus: 0.105, train: 0.041, motorcycle: 0.103, bike: 0, walking: 0 };
    
    return modes.map(mode => {
      const emissions = dist * factorMap[mode];
      const savings = Math.max(0, carEmissions - emissions);
      
      // Calculate duration
      const totalMin = Math.round((dist / speedMap[mode]) * 60);
      let durationStr = `${totalMin} mins`;
      if (totalMin >= 60) {
        const hrs = Math.floor(totalMin / 60);
        const mins = totalMin % 60;
        durationStr = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
      }
      
      const costStr = costMap[mode] === 0 ? 'Free' : `$${costMap[mode].toFixed(2)}`;
      
      return {
        mode,
        emissions: Math.round(emissions * 10) / 10,
        savings: Math.round(savings * 10) / 10,
        cost: costStr,
        duration: durationStr,
        distance: `${dist} km`
      };
    });
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination || !distance || distance <= 0) return;
    
    const calcRoutes = calculateRouteOptions(Number(distance));
    setRoutes(calcRoutes);
    
    // Choose appropriate default mode
    if (distance <= 5) {
      setSelectedMode('bike');
    } else {
      setSelectedMode('train');
    }
    
    setIsCalculated(true);
    setLoggedAlert(false);
  };

  const selectedRoute = routes.find(r => r.mode === selectedMode);

  // Handle logging carbon savings
  const handleLogGreenTrip = () => {
    if (!selectedRoute) return;
    setIsLogging(true);
    
    let description = `Commuted via ${selectedRoute.mode.toUpperCase()} (${source} ➔ ${destination})`;
    let distanceNum = Number(distance);
    
    mockFirestore.addLog('travel', description, distanceNum, 'km', selectedRoute.mode);
    
    setTimeout(() => {
      setIsLogging(false);
      setLoggedAlert(true);
      onLogAdded();
      
      setTimeout(() => setLoggedAlert(false), 3000);
    }, 1200);
  };

  // Map modes to icons
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'car': return Car;
      case 'bus': return Bus;
      case 'train': return Train;
      case 'bike': return Bike;
      default: return Footprints;
    }
  };

  // Map modes to classes/colors
  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'car': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'bus': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'train': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'bike': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  // Generate scientific recommendations based on formulas
  const getAIRecommendation = () => {
    const d = Number(distance);
    if (d <= 2) {
      return `For short journeys under 2 km, choosing **Walking** or **Cycling** is the ultimate green choice. Walking eliminates **100% of emissions** (saving ${(d * 0.192).toFixed(1)} kg CO₂ compared to driving) and significantly boosts cardiovascular wellness.`;
    } else if (d <= 15) {
      const bikeSavings = (d * 0.192).toFixed(1);
      const busSavings = (d * (0.192 - 0.105)).toFixed(1);
      return `For intermediate commutes of ${d} km, swapping a car for **Cycling** avoids **${bikeSavings} kg CO₂** completely. If weather or speed is a constraint, choosing the **Bus** cuts your footprint by **45%**, saving **${busSavings} kg CO₂** compared to single-occupancy driving.`;
    } else {
      const trainSavings = (d * (0.192 - 0.041)).toFixed(1);
      const trainPct = Math.round(((0.192 - 0.041) / 0.192) * 100);
      return `For long distances like this ${d} km commute, the **Train** represents the most efficient transit. Taking the train reduces carbon emissions by **${trainPct}%**, saving a substantial **${trainSavings} kg CO₂** compared to gas cars. Swapping 5 weekly drives for train rail offsets equivalent carbon of planting ${Math.round(parseFloat(trainSavings) * 5 * 52 / 22)} trees annually!`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          
          <div className="md:col-span-3 relative">
            <label htmlFor="route-source-input" className="text-xs text-slate-400 font-bold block mb-2">SOURCE</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-cyan-400" />
              <input
                id="route-source-input"
                type="text"
                required
                placeholder="Starting location"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="glass-input !pl-11 w-full text-sm py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="md:col-span-1 flex justify-center items-center py-2 md:py-0">
            <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center border border-white/10 select-none text-slate-500">
              <ArrowRight className="w-4 h-4 text-slate-400 rotate-90 md:rotate-0" />
            </div>
          </div>

          <div className="md:col-span-3 relative">
            <label htmlFor="route-destination-input" className="text-xs text-slate-400 font-bold block mb-2">DESTINATION</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-emerald-400" />
              <input
                id="route-destination-input"
                type="text"
                required
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="glass-input !pl-11 w-full text-sm py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="md:col-span-2 relative">
            <label htmlFor="route-distance-input" className="text-xs text-slate-400 font-bold block mb-2">DISTANCE (KM)</label>
            <input
              id="route-distance-input"
              type="number"
              required
              min="0.1"
              step="any"
              placeholder="e.g. 15"
              value={distance}
              onChange={(e) => setDistance(e.target.value === '' ? '' : Number(e.target.value))}
              className="glass-input w-full text-sm py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="glass-btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <Compass className="w-4 h-4" />
              <span>Optimize Route</span>
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {!isCalculated ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-card p-12 rounded-3xl border border-white/5 text-center flex flex-col items-center max-w-xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-6">
              <Compass className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Green Commute Planner</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Enter your origin, destination, and manual distance in kilometers above to compare transit emissions. Choose walks, cycling, or public rails to offset carbon output in real time.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            
            {/* Transit Comparison Grid */}
            <div className="lg:col-span-7 glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-md font-bold text-white">Compare Transit Alternatives</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Scientific Emission Coefficients</span>
              </div>

              {/* Route comparison list */}
              <div className="space-y-3">
                {routes.map((rt) => {
                  const ModeIcon = getModeIcon(rt.mode);
                  const modeColor = getModeColor(rt.mode);
                  const isSelected = selectedMode === rt.mode;
                  
                  return (
                    <button
                      key={rt.mode}
                      type="button"
                      onClick={() => setSelectedMode(rt.mode)}
                      aria-pressed={isSelected}
                      aria-label={`Select transit mode ${rt.mode}`}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isSelected
                          ? `${modeColor} ring-1 ring-white/10 scale-[1.01] border-opacity-100`
                          : 'border-white/5 bg-slate-900/30 text-slate-400 hover:text-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl glass-card flex items-center justify-center border border-white/5 bg-slate-950/40">
                          <ModeIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-200 block capitalize">{rt.mode}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{rt.duration} • {rt.cost}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`text-xs font-bold ${rt.emissions === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {rt.emissions.toFixed(1)} <span className="text-[9px] text-slate-500 font-bold">kg CO₂</span>
                        </span>
                        {rt.savings > 0 && (
                          <span className="text-[9px] text-emerald-400 font-bold block">
                            -{rt.savings.toFixed(1)} kg saved
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Insights & Log Panel */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              
              {/* Gemini AI Coaching Suggestions Box */}
              <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden bg-slate-950/40">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-2 mb-3.5">
                  <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
                  <span className="text-xs font-extrabold text-cyan-400 tracking-wider uppercase">EcoLens AI Insights</span>
                </div>
                <div 
                  className="text-xs text-slate-300 leading-relaxed font-medium space-y-2"
                  dangerouslySetInnerHTML={{ __html: getAIRecommendation().replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-extrabold">$1</strong>') }}
                />
              </div>

              {/* Carbon Savings Summary and Logger Card */}
              {selectedRoute && (
                <div className="glass-card p-6.5 rounded-3xl border border-emerald-500/20 bg-emerald-950/5 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mt-1 flex-shrink-0">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <div className="text-xs text-slate-400 font-bold">CARBON SAVINGS METRIC</div>
                      <div className="text-2xl font-extrabold text-white mt-1">
                        {selectedMode === 'car' ? (
                          <span className="text-rose-400">0.0 kg CO₂</span>
                        ) : (
                          <span className="text-emerald-400">-{selectedRoute.savings.toFixed(1)} kg CO₂</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        {selectedMode === 'car' 
                          ? 'Driving a private gas-fueled car generates standard emissions. Swap to bus, train, or cycling to log net-positive savings.'
                          : `Commuting via ${selectedRoute.mode} saves ${selectedRoute.savings} kg of carbon compared to standard driving. Log this activity to earn Green Points.`}
                      </p>

                      {selectedMode !== 'car' && (
                        <div className="mt-4">
                          <AnimatePresence mode="wait">
                            {loggedAlert ? (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20"
                              >
                                <Check className="w-4 h-4" />
                                <span>Commute Saved to Dashboard! +20 GP</span>
                              </motion.div>
                            ) : (
                              <button
                                onClick={handleLogGreenTrip}
                                disabled={isLogging}
                                className="glass-btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                              >
                                <span>{isLogging ? 'Logging Commute...' : 'Log Green Trip & Save'}</span>
                              </button>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
