import React, { useState } from 'react';
import { 
  Plus, 
  Car, 
  Lightbulb, 
  Apple, 
  ShoppingBag 
} from 'lucide-react';
import { 
  mockFirestore, 
  TRAVEL_FACTORS, 
  ELECTRICITY_FACTOR, 
  FOOD_FACTORS, 
  SHOPPING_FACTORS 
} from '../services/mockServices';
import { validateRequired, validateNumericInput, sanitizeText } from '../utils/validation';

interface CarbonLoggingFormProps {
  onLogAdded: () => void;
}

export const CarbonLoggingForm: React.FC<CarbonLoggingFormProps> = ({ onLogAdded }) => {
  const [category, setCategory] = useState<'travel' | 'energy' | 'food' | 'shopping'>('travel');
  const [subCategory, setSubCategory] = useState('car');
  const [description, setDescription] = useState('Commute by Car');
  const [amount, setAmount] = useState<number | ''>('');

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

  const liveCalc = getLiveCalculation();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedDesc = sanitizeText(description);
    const descValid = validateRequired(sanitizedDesc);
    const amountValResult = validateNumericInput(amount);
    if (!descValid || !amountValResult.isValid) return;

    let unit = 'units';
    if (category === 'travel') unit = 'km';
    else if (category === 'energy') unit = 'kWh';
    else if (category === 'food') unit = 'meals';
    else if (category === 'shopping') unit = 'items';

    mockFirestore.addLog(category, sanitizedDesc, Number(amount), unit, subCategory);
    
    setAmount('');
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

  const getUnitLabel = () => {
    if (category === 'travel') return 'Distance (km)';
    if (category === 'energy') return 'Usage (kWh)';
    if (category === 'food') return 'Number of meals';
    return 'Number of items';
  };

  return (
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
                { id: 'travel' as const, icon: Car, label: 'Travel', color: 'text-cyan-400 bg-cyan-950/20 border-cyan-500/20' },
                { id: 'energy' as const, icon: Lightbulb, label: 'Energy', color: 'text-amber-400 bg-amber-950/20 border-amber-500/20' },
                { id: 'food' as const, icon: Apple, label: 'Food', color: 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20' },
                { id: 'shopping' as const, icon: ShoppingBag, label: 'Shop', color: 'text-purple-400 bg-purple-950/20 border-purple-500/20' },
              ].map((cat) => {
                const isSelected = category === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
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
            {liveCalc && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs space-y-1 animate-fadeIn">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase block tracking-wider">Formula Preview</span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-slate-300 text-[11px]">{liveCalc.formula}</span>
                  <span className="text-emerald-400 font-extrabold text-xs mt-0.5">= {liveCalc.result}</span>
                </div>
              </div>
            )}
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
  );
};
export default CarbonLoggingForm;
