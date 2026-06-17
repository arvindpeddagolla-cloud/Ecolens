import React from 'react';
import type { EmissionsLog } from '../services/mockServices';
import { EcoScoreDial } from './EcoScoreDial';
import { QuickStatsGrid } from './QuickStatsGrid';
import { CarbonLoggingForm } from './CarbonLoggingForm';
import { CategoryBreakdown } from './CategoryBreakdown';
import { RecentActivityList } from './RecentActivityList';
import { EmissionsTimeline } from './EmissionsTimeline';

interface DashboardTabProps {
  logs: EmissionsLog[];
  onLogAdded: () => void;
  onLogDeleted: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ logs, onLogAdded, onLogDeleted }) => {
  // Calculations & Metrics
  const totalEmissions = logs.reduce((acc, curr) => acc + curr.co2Emissions, 0);
  const totalEmissionsRound = Math.round(totalEmissions * 10) / 10;
  
  // Tree offsets: 1 mature tree absorbs ~22kg of CO2 per year
  const treesNeeded = Math.max(1, Math.round(totalEmissions / 22));

  // Compute Eco Score (Scale 1 to 100) using strict brackets
  let ecoScore: number;
  if (totalEmissions <= 20) {
    ecoScore = 100;
  } else if (totalEmissions <= 50) {
    ecoScore = 80;
  } else if (totalEmissions <= 100) {
    ecoScore = 60;
  } else if (totalEmissions <= 200) {
    ecoScore = 40;
  } else {
    ecoScore = 20;
  }

  // Daily, Weekly, Monthly, Yearly footprints
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMs = new Date(todayStr).getTime();

  const dailyEmissions = logs
    .filter(log => log.date === todayStr)
    .reduce((acc, curr) => acc + curr.co2Emissions, 0);

  const weeklyEmissions = logs
    .filter(log => {
      const logTime = new Date(log.date).getTime();
      return (todayMs - logTime) <= 7 * 24 * 60 * 60 * 1000;
    })
    .reduce((acc, curr) => acc + curr.co2Emissions, 0);

  const monthlyEmissions = logs
    .filter(log => {
      const logTime = new Date(log.date).getTime();
      return (todayMs - logTime) <= 30 * 24 * 60 * 60 * 1000;
    })
    .reduce((acc, curr) => acc + curr.co2Emissions, 0);

  const yearlyEmissions = logs
    .filter(log => {
      const logTime = new Date(log.date).getTime();
      return (todayMs - logTime) <= 365 * 24 * 60 * 60 * 1000;
    })
    .reduce((acc, curr) => acc + curr.co2Emissions, 0);

  const dailyRound = Math.round(dailyEmissions * 10) / 10;
  const weeklyRound = Math.round(weeklyEmissions * 10) / 10;
  const monthlyRound = Math.round(monthlyEmissions * 10) / 10;
  const yearlyRound = Math.round(yearlyEmissions * 10) / 10;

  // Category emissions breakdown
  const categorySums = logs.reduce(
    (acc, curr) => {
      acc[curr.category] += curr.co2Emissions;
      return acc;
    },
    { travel: 0, energy: 0, food: 0, shopping: 0 }
  );

  return (
    <div className="space-y-10">
      
      {/* 1. Dashboard Grid - Eco Score Card and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <EcoScoreDial ecoScore={ecoScore} />
        
        <QuickStatsGrid
          totalEmissionsRound={totalEmissionsRound}
          treesNeeded={treesNeeded}
          dailyRound={dailyRound}
          weeklyRound={weeklyRound}
          monthlyRound={monthlyRound}
          yearlyRound={yearlyRound}
        />
      </div>
 
      {/* 2. Logging and Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <CarbonLoggingForm onLogAdded={onLogAdded} />

        <div className="lg:col-span-7 grid grid-cols-1 gap-8">
          <CategoryBreakdown 
            categorySums={categorySums}
            totalEmissions={totalEmissions}
          />
          
          <RecentActivityList 
            logs={logs}
            onLogDeleted={onLogDeleted}
          />
        </div>
      </div>

      {/* 3. History Chart */}
      <EmissionsTimeline logs={logs} />

    </div>
  );
};
export default DashboardTab;
