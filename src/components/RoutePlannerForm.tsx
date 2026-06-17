import React from 'react';
import { Compass, MapPin, ArrowRight } from 'lucide-react';

interface RoutePlannerFormProps {
  source: string;
  setSource: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  distance: number | '';
  setDistance: (val: number | '') => void;
  handleCalculate: (e: React.FormEvent) => void;
}

export const RoutePlannerForm: React.FC<RoutePlannerFormProps> = ({
  source,
  setSource,
  destination,
  setDestination,
  distance,
  setDistance,
  handleCalculate
}) => {
  return (
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
  );
};
export default RoutePlannerForm;
