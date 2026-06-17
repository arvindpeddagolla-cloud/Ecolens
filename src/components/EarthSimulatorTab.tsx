import React, { useState } from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import type { EmissionsLog } from '../services/mockServices';
import { SimulatorControls } from './SimulatorControls';
import { EnvironmentalGlobe } from './EnvironmentalGlobe';

interface EarthSimulatorTabProps {
  logs: EmissionsLog[];
}

export const EarthSimulatorTab: React.FC<EarthSimulatorTabProps> = ({ logs }) => {
  // Compute user actual weekly carbon footprint as initial state
  const actualEmissions = logs.reduce((acc, curr) => acc + curr.co2Emissions, 0);
  const roundedActual = Math.round(actualEmissions) || 100; // fallback to 100 if no logs

  // Baseline weekly emissions (adjustable by slider)
  const [baselineWeekly, setBaselineWeekly] = useState(roundedActual);
  
  // Track previous value to sync state during render (avoids setState in useEffect)
  const [prevRoundedActual, setPrevRoundedActual] = useState(roundedActual);
  if (roundedActual !== prevRoundedActual) {
    setPrevRoundedActual(roundedActual);
    setBaselineWeekly(roundedActual);
  }
  
  // Forecast period state: '1month' | '1year' | '5years'
  const [forecastPeriod, setForecastPeriod] = useState<'1month' | '1year' | '5years'>('1year');

  // Selected lifestyle scenario state: 'current' | 'improved' | 'netzero'
  const [selectedScenario, setSelectedScenario] = useState<'current' | 'improved' | 'netzero'>('current');

  const handleResetToActual = () => {
    setBaselineWeekly(roundedActual);
  };

  // Scenario multipliers
  const periodMultipliers = {
    '1month': 4.33,
    '1year': 52,
    '5years': 260
  };

  const multiplier = periodMultipliers[forecastPeriod];

  // Calculate carbon footprints for each scenario
  const currentFootprint = baselineWeekly * multiplier;
  const improvedFootprint = baselineWeekly * 0.6 * multiplier;
  const netzeroFootprint = baselineWeekly * 0.05 * multiplier;

  // Determine equivalent weekly emissions based on selected scenario to drive indicators
  let equivalentWeekly = baselineWeekly;
  if (selectedScenario === 'improved') {
    equivalentWeekly = baselineWeekly * 0.6;
  } else if (selectedScenario === 'netzero') {
    equivalentWeekly = baselineWeekly * 0.05;
  }

  return (
    <div className="space-y-8">
      
      {/* Simulation Header */}
      <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-eco-400" />
            <span>Earth Impact Simulator</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Model your future carbon emissions. Adjust weekly baseline emissions using the slider, select forecast periods, and switch between lifestyle scenarios to view Earth's vital signs.
          </p>
        </div>

        <button
          onClick={handleResetToActual}
          className="glass-btn-secondary py-2.5 px-4.5 text-xs font-bold flex items-center gap-1.5 border border-white/10 hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync to Actual Logs ({roundedActual} kg)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <EnvironmentalGlobe
          equivalentWeekly={equivalentWeekly}
          forecastPeriod={forecastPeriod}
          selectedScenario={selectedScenario}
          currentFootprint={currentFootprint}
          improvedFootprint={improvedFootprint}
          netzeroFootprint={netzeroFootprint}
        />

        <SimulatorControls
          baselineWeekly={baselineWeekly}
          setBaselineWeekly={setBaselineWeekly}
          forecastPeriod={forecastPeriod}
          setForecastPeriod={setForecastPeriod}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          currentFootprint={currentFootprint}
          improvedFootprint={improvedFootprint}
          netzeroFootprint={netzeroFootprint}
        />
      </div>

    </div>
  );
};
export default EarthSimulatorTab;
