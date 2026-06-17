import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingSurveyProps {
  onboardingStep: number;
  setOnboardingStep: React.Dispatch<React.SetStateAction<number>>;
  onboardTransport: 'car' | 'bus' | 'train' | 'bike' | 'walking';
  setOnboardTransport: (mode: 'car' | 'bus' | 'train' | 'bike' | 'walking') => void;
  onboardKwh: number;
  setOnboardKwh: (kwh: number) => void;
  onboardFood: 'vegetarian' | 'non-vegetarian' | 'vegan';
  setOnboardFood: (food: 'vegetarian' | 'non-vegetarian' | 'vegan') => void;
  onboardShop: 'low' | 'medium' | 'high';
  setOnboardShop: (shop: 'low' | 'medium' | 'high') => void;
  handleOnboardingComplete: () => void;
}

export const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({
  onboardingStep,
  setOnboardingStep,
  onboardTransport,
  setOnboardTransport,
  onboardKwh,
  setOnboardKwh,
  onboardFood,
  setOnboardFood,
  onboardShop,
  setOnboardShop,
  handleOnboardingComplete
}) => {
  return (
    <div className="max-w-xl mx-auto glass-card p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden my-8">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
      
      {/* Step HUD */}
      <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-6">
        <span>ONBOARDING PROFILE SETUP</span>
        <span className="text-emerald-400">Step {onboardingStep} of 4</span>
      </div>

      {/* Steps Rendering */}
      <AnimatePresence mode="wait">
        {onboardingStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white">1. What is your primary mode of transit?</h3>
            <p className="text-xs text-slate-400">This helps estimate your baseline travel carbon footprint (computed in km).</p>
            
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'car' as const, label: '🚗 Private Petrol Car', desc: '0.192 kg CO₂ per km' },
                { id: 'bus' as const, label: '🚌 Public Transit Bus', desc: '0.105 kg CO₂ per km' },
                { id: 'train' as const, label: '🚆 Electric Subway / Rail', desc: '0.041 kg CO₂ per km' },
                { id: 'bike' as const, label: '🚲 Bicycle / E-Bike', desc: '0.000 kg CO₂ per km' },
                { id: 'walking' as const, label: '🚶 Walking / Footwear', desc: '0.000 kg CO₂ per km' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setOnboardTransport(mode.id)}
                  aria-pressed={onboardTransport === mode.id}
                  className={`p-4 rounded-xl border text-left text-xs font-semibold transition-all ${
                    onboardTransport === mode.id 
                      ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                      : 'border-white/5 bg-slate-900/30 text-slate-400 hover:text-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                >
                  <div className="flex justify-between items-center">
                    <span>{mode.label}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{mode.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {onboardingStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white">2. Estimate monthly home electricity usage</h3>
            <p className="text-xs text-slate-400">Calculated using our carbon index factor of **0.82 kg CO₂/kWh**.</p>
            
            <div className="space-y-4">
              <label htmlFor="onboard-kwh-input" className="flex justify-between items-center text-xs font-bold text-slate-300 cursor-pointer">
                <span>MONTHLY USAGE</span>
                <span className="text-emerald-400 text-sm">{onboardKwh} kWh</span>
              </label>
              <input
                id="onboard-kwh-input"
                type="range"
                min="20"
                max="500"
                step="10"
                value={onboardKwh}
                onChange={(e) => setOnboardKwh(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                <span>20 kWh (Eco apartments)</span>
                <span>500 kWh (High consumption)</span>
              </div>
            </div>
          </motion.div>
        )}

        {onboardingStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white">3. What is your general dietary preference?</h3>
            <p className="text-xs text-slate-400">Diet accounts for roughly 25% of global personal emissions profiles.</p>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'non-vegetarian' as const, label: '🥩 Non-Vegetarian', desc: 'Frequent red meat, beef (factor: 27.0), chicken (factor: 6.9)' },
                { id: 'vegetarian' as const, label: '🥗 Vegetarian', desc: 'Eggs (factor: 4.8), dairy, vegetarian recipes (factor: 2.0)' },
                { id: 'vegan' as const, label: '🌱 Strict Vegan', desc: '100% plant-based recipes, zero dairy (factor: 1.5)' },
              ].map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => setOnboardFood(food.id)}
                  aria-pressed={onboardFood === food.id}
                  className={`p-4.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    onboardFood === food.id 
                      ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                      : 'border-white/5 bg-slate-900/30 text-slate-400 hover:text-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                >
                  <span className="block text-white font-bold">{food.label}</span>
                  <span className="block text-[10px] text-slate-500 mt-1 font-medium">{food.desc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {onboardingStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white">4. How often do you buy retail/consumer goods?</h3>
            <p className="text-xs text-slate-400">This weights clothing purchases, electronics, and general product packaging waste.</p>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'low' as const, label: '🛍️ Low', desc: 'Essential goods only' },
                { id: 'medium' as const, label: '🛍️ Medium', desc: 'Average consumer habits' },
                { id: 'high' as const, label: '🛍️ High', desc: 'Frequent fashion / gadgets' },
              ].map((shop) => (
                <button
                  key={shop.id}
                  type="button"
                  onClick={() => setOnboardShop(shop.id)}
                  aria-pressed={onboardShop === shop.id}
                  className={`p-4 rounded-xl border text-center text-xs font-semibold transition-all flex flex-col items-center justify-center gap-2 ${
                    onboardShop === shop.id 
                      ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                      : 'border-white/5 bg-slate-900/30 text-slate-400 hover:text-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                >
                  <span className="text-white font-bold">{shop.label}</span>
                  <span className="text-[9px] text-slate-500 leading-snug">{shop.desc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center mt-8 pt-5 border-t border-slate-800/80">
        <button
          disabled={onboardingStep === 1}
          onClick={() => setOnboardingStep(prev => prev - 1)}
          className="glass-btn-secondary px-4 py-2 text-xs flex items-center gap-1 disabled:opacity-30 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {onboardingStep < 4 ? (
          <button
            onClick={() => setOnboardingStep(prev => prev + 1)}
            className="glass-btn-primary px-4 py-2 text-xs flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleOnboardingComplete}
            className="glass-btn-primary px-5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            Calculate My Score 🌱
          </button>
        )}
      </div>
    </div>
  );
};
export default OnboardingSurvey;
