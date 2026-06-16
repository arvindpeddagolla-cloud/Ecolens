import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { 
  Plus, 
  Trash2, 
  Car, 
  Lightbulb, 
  Apple, 
  ShoppingBag, 
  Info, 
  TrendingDown, 
  Calendar
} from 'lucide-react';
import type { EmissionsLog } from '../services/mockServices';
import { 
  mockFirestore, 
  TRAVEL_FACTORS, 
  ELECTRICITY_FACTOR, 
  FOOD_FACTORS, 
  SHOPPING_FACTORS 
} from '../services/mockServices';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardTabProps {
  logs: EmissionsLog[];
  onLogAdded: () => void;
  onLogDeleted: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ logs, onLogAdded, onLogDeleted }) => {
  // Input form state
  const [category, setCategory] = useState<'travel' | 'energy' | 'food' | 'shopping'>('travel');
  const [subCategory, setSubCategory] = useState('car');
  const [description, setDescription] = useState('Commute by Car');
  const [amount, setAmount] = useState<number | ''>('');
  
  // Live calculation preview formula
  const getLiveCalculation = () => {
    if (amount === '' || Number(amount) <= 0) return null;
    
    let factor = 0;
    let factorLabel = '';
    
    if (category === 'travel') {
      factor = TRAVEL_FACTORS[subCategory as keyof typeof TRAVEL_FACTORS] || 0;
      factorLabel = 'kg CO₂/km';
    } else if (category === 'energy') {
      factor = ELECTRICITY_FACTOR;
      factorLabel = 'kg CO₂/kWh';
    } else if (category === 'food') {
      factor = FOOD_FACTORS[subCategory as keyof typeof FOOD_FACTORS] || 0;
      factorLabel = 'kg CO₂/meal';
    } else if (category === 'shopping') {
      factor = SHOPPING_FACTORS[subCategory as keyof typeof SHOPPING_FACTORS] || 0;
      factorLabel = 'kg CO₂/item';
    }
    
    const result = Math.round(Number(amount) * factor * 100) / 100;
    const unit = category === 'travel' ? 'km' : category === 'energy' ? 'kWh' : category === 'food' ? 'meals' : 'items';
    
    return {
      formula: `${amount} ${unit} × ${factor} ${factorLabel}`,
      result: `${result} kg CO₂`
    };
  };

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

  const liveCalc = getLiveCalculation();
  
  // Chart timeframe state: 'weekly' | 'monthly'
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  const handleCategoryChange = (cat: 'travel' | 'energy' | 'food' | 'shopping') => {
    setCategory(cat);
    if (cat === 'travel') {
      setSubCategory('car');
      setDescription('Commute by Car');
    } else if (cat === 'energy') {
      setSubCategory('grid');
      setDescription('Grid Electricity Usage');
    } else if (cat === 'food') {
      setSubCategory('beef');
      setDescription('Beef Meal Dinner');
    } else if (cat === 'shopping') {
      setSubCategory('plastic');
      setDescription('Plastic Product Purchase');
    }
  };

  // Handle logging form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || amount <= 0) return;

    let unit = 'units';
    if (category === 'travel') unit = 'km';
    else if (category === 'energy') unit = 'kWh';
    else if (category === 'food') unit = 'meals';
    else if (category === 'shopping') unit = 'items';

    mockFirestore.addLog(category, description, Number(amount), unit, subCategory);
    
    // Clear inputs and notify parent to re-fetch logs
    setAmount('');
    // Keep description synchronized with default
    if (category === 'travel') {
      setDescription(`Commute by ${subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}`);
    } else if (category === 'energy') {
      setDescription('Grid Electricity Usage');
    } else if (category === 'food') {
      setDescription(`${subCategory.charAt(0).toUpperCase() + subCategory.slice(1)} Meal`);
    } else if (category === 'shopping') {
      setDescription('Shopping Item');
    }
    onLogAdded();
  };

  // Handle log delete
  const handleDeleteLog = (id: string) => {
    mockFirestore.deleteLog(id);
    onLogDeleted();
  };

  // 1. Calculations & Metrics
  const totalEmissions = logs.reduce((acc, curr) => acc + curr.co2Emissions, 0);
  const totalEmissionsRound = Math.round(totalEmissions * 10) / 10;
  
  // Tree offsets: 1 mature tree absorbs ~22kg of CO2 per year
  const treesNeeded = Math.max(1, Math.round(totalEmissions / 22));

  // Compute Eco Score (Scale 1 to 100) using strict brackets:
  // 0-20kg = 100, 20-50kg = 80, 50-100kg = 60, 100-200kg = 40, 200+kg = 20
  let ecoScore = 100;
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

  // Form unit placeholders
  const getUnitLabel = () => {
    if (category === 'travel') return 'Distance (km)';
    if (category === 'energy') return 'Usage (kWh)';
    if (category === 'food') return 'Number of meals';
    return 'Number of items';
  };

  // 2. Chart Configurations
  // A. Doughnut Category Breakdown
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
          label: (context: any) => ` ${context.label}: ${context.raw.toFixed(1)} kg CO₂`,
        },
      },
    },
  };

  // B. Weekly / Monthly Carbon Graph
  // Mock grouping logs by date
  const getChartData = () => {
    const dates = timeframe === 'weekly' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      
    // Seed some static values + add logged values in
    const travelData = timeframe === 'weekly' ? [12, 8, 15, 6, 2, logs.filter(l => l.category === 'travel').reduce((a,c) => a+c.co2Emissions, 0), 4] : [45, 52, 40, logs.filter(l => l.category === 'travel').reduce((a,c) => a+c.co2Emissions, 0)];
    const energyData = timeframe === 'weekly' ? [25, 25, 25, 25, 25, logs.filter(l => l.category === 'energy').reduce((a,c) => a+c.co2Emissions, 0) / 7, 25] : [100, 100, 100, logs.filter(l => l.category === 'energy').reduce((a,c) => a+c.co2Emissions, 0)];
    const foodData = timeframe === 'weekly' ? [4.2, 5.1, 3.8, 4.5, 4.8, logs.filter(l => l.category === 'food').reduce((a,c) => a+c.co2Emissions, 0) / 2, 3.2] : [22, 18, 25, logs.filter(l => l.category === 'food').reduce((a,c) => a+c.co2Emissions, 0)];
    
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

  // Determine Eco Score color
  const getScoreColor = () => {
    if (ecoScore >= 80) return 'text-emerald-400 stroke-emerald-400';
    if (ecoScore >= 60) return 'text-cyan-400 stroke-cyan-400';
    if (ecoScore >= 40) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  return (
    <div className="space-y-10">
      
      {/* 1. Dashboard Grid - Eco Score Card and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Animated Eco Score Widget */}
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

        {/* Quick Stats Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          
          <div role="status" aria-label="Total carbon logged stats" className="glass-card p-6.5 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
            <div>
              <span className="text-xs text-slate-400 font-bold block mb-1">TOTAL CARBON LOGGED</span>
              <span className="text-4xl font-extrabold text-white">{totalEmissionsRound}</span>
              <span className="text-sm text-slate-400 ml-1">kg CO₂</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-4">
              <TrendingDown className="w-4 h-4" />
              <span>-12.4% baseline reduction</span>
            </div>
          </div>

          <div role="status" aria-label="Tree offset equivalent stats" className="glass-card p-6.5 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            <div>
              <span className="text-xs text-slate-400 font-bold block mb-1">OFFSET EQUIVALENT</span>
              <span className="text-4xl font-extrabold text-emerald-400">{treesNeeded}</span>
              <span className="text-sm text-slate-400 ml-1">trees</span>
            </div>
            <div className="text-xs text-slate-400 mt-4 leading-snug">
              Annual growth needed to absorb your logged footprint.
            </div>
          </div>

          <div role="status" aria-label="Carbon saved stats" className="glass-card p-6.5 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
            <div>
              <span className="text-xs text-slate-400 font-bold block mb-1">CARBON SAVED</span>
              <span className="text-4xl font-extrabold text-cyan-400">18.5</span>
              <span className="text-sm text-slate-400 ml-1">kg CO₂</span>
            </div>
            <div className="text-xs text-slate-300 mt-4">
              Through green commutes and smart meals logged this week.
            </div>
          </div>

          <div role="status" aria-label="Carbon footprint intervals" className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
            <div>
              <span className="text-xs text-slate-400 font-bold block mb-2">FOOTPRINT BY INTERVAL</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-900/40 p-2 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-500 block font-bold">DAILY</span>
                  <span className="text-xs font-extrabold text-white">{dailyRound} <span className="text-[8px] text-slate-400 font-normal">kg</span></span>
                </div>
                <div className="bg-slate-900/40 p-2 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-500 block font-bold">WEEKLY</span>
                  <span className="text-xs font-extrabold text-white">{weeklyRound} <span className="text-[8px] text-slate-400 font-normal">kg</span></span>
                </div>
                <div className="bg-slate-900/40 p-2 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-500 block font-bold">MONTHLY</span>
                  <span className="text-xs font-extrabold text-white">{monthlyRound} <span className="text-[8px] text-slate-400 font-normal">kg</span></span>
                </div>
                <div className="bg-slate-900/40 p-2 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-500 block font-bold">YEARLY</span>
                  <span className="text-xs font-extrabold text-white">{yearlyRound} <span className="text-[8px] text-slate-400 font-normal">kg</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* 2. Logging and Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form to log new emissions */}
        <div className="lg:col-span-5 glass-card p-8 rounded-3xl border border-white/5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-eco-400" />
              <span>Log Carbon Footprint</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Category picker icons */}
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-2.5">CATEGORY</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'travel', icon: Car, label: 'Travel', color: 'text-cyan-400 bg-cyan-950/20 border-cyan-500/20' },
                    { id: 'energy', icon: Lightbulb, label: 'Energy', color: 'text-amber-400 bg-amber-950/20 border-amber-500/20' },
                    { id: 'food', icon: Apple, label: 'Food', color: 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20' },
                    { id: 'shopping', icon: ShoppingBag, label: 'Shop', color: 'text-purple-400 bg-purple-950/20 border-purple-500/20' },
                  ].map((cat) => {
                    const isSelected = category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id as any)}
                        aria-pressed={isSelected}
                        aria-label={`Select category ${cat.label}`}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          isSelected 
                            ? `${cat.color} ring-1 ring-offset-0 ring-white/10 scale-105 border-opacity-100` 
                            : 'border-white/5 bg-slate-900/30 text-slate-500 hover:text-slate-300'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                      >
                        <Icon className="w-5 h-5 mb-1.5" />
                        <span className="text-[10px] font-bold">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subcategory selection dropdown */}
              <div>
                <label htmlFor="dashboard-type-select" className="text-xs text-slate-400 font-bold block mb-2">TYPE</label>
                <select
                  id="dashboard-type-select"
                  value={subCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSubCategory(val);
                    // Update default description dynamically
                    if (category === 'travel') {
                      setDescription(`Commute by ${val.charAt(0).toUpperCase() + val.slice(val.indexOf(val))}`);
                    } else if (category === 'food') {
                      setDescription(`${val.charAt(0).toUpperCase() + val.slice(1)} Meal`);
                    } else if (category === 'shopping') {
                      const labelMap: Record<string, string> = {
                        plastic: 'Plastic Product',
                        clothing: 'Clothing Item',
                        electronics: 'Electronics Purchase',
                        reusable: 'Reusable Item',
                        paper: 'Paper Product'
                      };
                      setDescription(labelMap[val] || 'Shopping Item');
                    }
                  }}
                  className="glass-input w-full text-sm py-2.5 px-4 bg-slate-950/40 border border-white/10 rounded-xl text-white outline-none focus:border-eco-500/50 focus:ring-2 focus:ring-emerald-500/30"
                >
                  {category === 'travel' && (
                    <>
                      <option value="car" className="bg-slate-950 text-white">Car (0.192 kg CO₂/km)</option>
                      <option value="bus" className="bg-slate-950 text-white">Bus (0.105 kg CO₂/km)</option>
                      <option value="train" className="bg-slate-950 text-white">Train (0.041 kg CO₂/km)</option>
                      <option value="motorcycle" className="bg-slate-950 text-white">Motorcycle (0.103 kg CO₂/km)</option>
                      <option value="bike" className="bg-slate-950 text-white">Bike (0 kg CO₂/km)</option>
                      <option value="walking" className="bg-slate-950 text-white">Walking (0 kg CO₂/km)</option>
                    </>
                  )}
                  {category === 'energy' && (
                    <option value="grid" className="bg-slate-950 text-white">Grid Electricity (0.82 kg CO₂/kWh)</option>
                  )}
                  {category === 'food' && (
                    <>
                      <option value="beef" className="bg-slate-950 text-white">Beef (27.0 kg CO₂/meal)</option>
                      <option value="lamb" className="bg-slate-950 text-white">Lamb (24.0 kg CO₂/meal)</option>
                      <option value="chicken" className="bg-slate-950 text-white">Chicken (6.9 kg CO₂/meal)</option>
                      <option value="fish" className="bg-slate-950 text-white">Fish (5.0 kg CO₂/meal)</option>
                      <option value="egg" className="bg-slate-950 text-white">Egg (4.8 kg CO₂/meal)</option>
                      <option value="vegetarian" className="bg-slate-950 text-white">Vegetarian (2.0 kg CO₂/meal)</option>
                      <option value="vegan" className="bg-slate-950 text-white">Vegan (1.5 kg CO₂/meal)</option>
                    </>
                  )}
                  {category === 'shopping' && (
                    <>
                      <option value="plastic" className="bg-slate-950 text-white">Plastic Product (6.0 kg CO₂/item)</option>
                      <option value="clothing" className="bg-slate-950 text-white">Clothing (15.0 kg CO₂/item)</option>
                      <option value="electronics" className="bg-slate-950 text-white">Electronics (75.0 kg CO₂/item)</option>
                      <option value="reusable" className="bg-slate-950 text-white">Reusable Bottle/Bag (1.5 kg CO₂/item)</option>
                      <option value="paper" className="bg-slate-950 text-white">Paper Product (2.0 kg CO₂/item)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="dashboard-description-input" className="text-xs text-slate-400 font-bold block mb-2">DESCRIPTION</label>
                <input
                  id="dashboard-description-input"
                  type="text"
                  required
                  placeholder="e.g. Driving gas sedan, Beef tacos, AC run"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="dashboard-amount-input" className="text-xs text-slate-400 font-bold block mb-2">{getUnitLabel().toUpperCase()}</label>
                <input
                  id="dashboard-amount-input"
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="glass-input w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Live Formula Preview Zone */}
              <div aria-live="polite" className="min-h-[60px]">
                {liveCalc ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs space-y-1 animate-fadeIn">
                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase block tracking-wider">Formula Preview</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-slate-300 text-[11px]">{liveCalc.formula}</span>
                      <span className="text-emerald-400 font-extrabold text-xs mt-0.5">= {liveCalc.result}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                className="glass-btn-primary w-full py-3 mt-4 text-sm font-semibold flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <Plus className="w-4 h-4" />
                <span>Log Emissions</span>
              </button>
            </form>
          </div>
        </div>

        {/* Charts & Breakdown Display */}
        <div className="lg:col-span-7 grid grid-cols-1 gap-8">
          {/* Doughnut Category Chart */}
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

          {/* Recent Carbon Activity Table (Relocated next to the input form) */}
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
        </div>
      </div>

      {/* 3. History Chart */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Dynamic Timeline Area Chart */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-eco-400" />
              <span>Emissions Log Timeline</span>
            </h3>
            
            {/* Toggle weekly/monthly */}
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
    </div>
  );
};
