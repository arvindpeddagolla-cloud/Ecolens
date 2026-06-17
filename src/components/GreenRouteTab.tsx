import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { RoutePlannerForm } from './RoutePlannerForm';
import { RouteComparisonPanel } from './RouteComparisonPanel';
import type { CustomRouteOption } from './RouteComparisonPanel';
import { mockFirestore } from '../services/mockServices';
import { sanitizeText } from '../utils/validation';

interface GreenRouteTabProps {
  onLogAdded: () => void;
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
    const sanitizedSource = sanitizeText(source);
    const sanitizedDest = sanitizeText(destination);
    if (!sanitizedSource || !sanitizedDest || !distance || distance <= 0) return;
    
    setSource(sanitizedSource);
    setDestination(sanitizedDest);
    
    const calcRoutes = calculateRouteOptions(Number(distance));
    setRoutes(calcRoutes);
    
    if (distance <= 5) {
      setSelectedMode('bike');
    } else {
      setSelectedMode('train');
    }
    
    setIsCalculated(true);
    setLoggedAlert(false);
  };

  const selectedRoute = routes.find(r => r.mode === selectedMode);

  const handleLogGreenTrip = () => {
    if (!selectedRoute) return;
    setIsLogging(true);
    
    const sanitizedSource = sanitizeText(source);
    const sanitizedDest = sanitizeText(destination);
    const description = `Commuted via ${selectedRoute.mode.toUpperCase()} (${sanitizedSource} ➔ ${sanitizedDest})`;
    const distanceNum = Number(distance);
    
    mockFirestore.addLog('travel', description, distanceNum, 'km', selectedRoute.mode);
    
    setTimeout(() => {
      setIsLogging(false);
      setLoggedAlert(true);
      onLogAdded();
      
      setTimeout(() => setLoggedAlert(false), 3000);
    }, 1200);
  };

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
      <RoutePlannerForm
        source={source}
        setSource={setSource}
        destination={destination}
        setDestination={setDestination}
        distance={distance}
        setDistance={setDistance}
        handleCalculate={handleCalculate}
      />

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
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <RouteComparisonPanel
              routes={routes}
              selectedMode={selectedMode}
              setSelectedMode={setSelectedMode}
              selectedRoute={selectedRoute}
              isLogging={isLogging}
              loggedAlert={loggedAlert}
              handleLogGreenTrip={handleLogGreenTrip}
              recommendationText={getAIRecommendation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default GreenRouteTab;
