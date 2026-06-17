import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Calendar } from 'lucide-react';
import type { EmissionsLog } from '../services/mockServices';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EmissionsTimelineProps {
  logs: EmissionsLog[];
}

export const EmissionsTimeline: React.FC<EmissionsTimelineProps> = ({ logs }) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  const getChartData = () => {
    const dates = timeframe === 'weekly' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      
    const travelData = timeframe === 'weekly' 
      ? [12, 8, 15, 6, 2, logs.filter(l => l.category === 'travel').reduce((a, c) => a + c.co2Emissions, 0), 4] 
      : [45, 52, 40, logs.filter(l => l.category === 'travel').reduce((a, c) => a + c.co2Emissions, 0)];
      
    const energyData = timeframe === 'weekly' 
      ? [25, 25, 25, 25, 25, logs.filter(l => l.category === 'energy').reduce((a, c) => a + c.co2Emissions, 0) / 7, 25] 
      : [100, 100, 100, logs.filter(l => l.category === 'energy').reduce((a, c) => a + c.co2Emissions, 0)];
      
    const foodData = timeframe === 'weekly' 
      ? [4.2, 5.1, 3.8, 4.5, 4.8, logs.filter(l => l.category === 'food').reduce((a, c) => a + c.co2Emissions, 0) / 2, 3.2] 
      : [22, 18, 25, logs.filter(l => l.category === 'food').reduce((a, c) => a + c.co2Emissions, 0)];
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Travel',
          data: travelData,
          backgroundColor: 'rgba(14, 165, 233, 0.4)',
          borderColor: '#0ea5e9',
          borderWidth: 2,
          fill: true,
        },
        {
          label: 'Energy',
          data: energyData,
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          borderColor: '#f59e0b',
          borderWidth: 2,
          fill: true,
        },
        {
          label: 'Food',
          data: foodData,
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: '#22c55e',
          borderWidth: 2,
          fill: true,
        }
      ]
    };
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit' } },
        title: {
          display: true,
          text: 'kg CO₂',
          color: '#94a3b8',
          font: { family: 'Outfit' }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
          font: { family: 'Outfit', size: 11 }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="glass-card p-6 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-eco-400" />
            <span>Emissions Log Timeline</span>
          </h3>
          
          <div className="flex p-0.5 rounded-lg bg-slate-900 border border-white/5 text-xs select-none">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3.5 py-1.5 rounded-md font-semibold transition-all ${
                timeframe === 'weekly' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3.5 py-1.5 rounded-md font-semibold transition-all ${
                timeframe === 'monthly' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="h-64 relative">
          <Line data={getChartData()} options={lineOptions} />
        </div>
      </div>
    </div>
  );
};
export default EmissionsTimeline;
