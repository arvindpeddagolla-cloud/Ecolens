import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryBreakdownProps {
  categorySums: {
    travel: number;
    energy: number;
    food: number;
    shopping: number;
  };
  totalEmissions: number;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categorySums,
  totalEmissions
}) => {
  const doughnutData = {
    labels: ['Travel 🚗', 'Energy ⚡', 'Food 🍔', 'Shopping 🛍️'],
    datasets: [
      {
        data: [
          categorySums.travel,
          categorySums.energy,
          categorySums.food,
          categorySums.shopping,
        ],
        backgroundColor: [
          'rgba(14, 165, 233, 0.7)',  // blue (cyber-500)
          'rgba(245, 158, 11, 0.7)',  // amber
          'rgba(34, 197, 94, 0.7)',   // green (eco-500)
          'rgba(168, 85, 247, 0.7)',  // purple
        ],
        borderColor: [
          '#0ea5e9',
          '#f59e0b',
          '#22c55e',
          '#a855f7',
        ],
        borderWidth: 1.5,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#cbd5e1',
          font: { family: 'Outfit', size: 12 },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            const rawVal = context.raw;
            const numVal = typeof rawVal === 'number' ? rawVal : 0;
            return ` ${context.label}: ${numVal.toFixed(1)} kg CO₂`;
          },
        },
      },
    },
  };

  return (
    <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl flex flex-col md:flex-row gap-6 items-center">
      <div className="w-full md:w-1/2 h-56 relative">
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>
      <div className="w-full md:w-1/2 space-y-4">
        <h4 className="text-md font-bold text-white mb-2">Category Breakdown</h4>
        <div className="space-y-3">
          {[
            { label: 'Travel', sum: categorySums.travel, color: 'bg-cyan-500' },
            { label: 'Energy', sum: categorySums.energy, color: 'bg-amber-500' },
            { label: 'Food', sum: categorySums.food, color: 'bg-emerald-500' },
            { label: 'Shopping', sum: categorySums.shopping, color: 'bg-purple-500' }
          ].map((item) => {
            const pct = totalEmissions > 0 ? Math.round((item.sum / totalEmissions) * 100) : 0;
            return (
              <div key={item.label} className="text-xs">
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>{item.label}</span>
                  <span>{item.sum.toFixed(1)} kg CO₂ ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default CategoryBreakdown;
