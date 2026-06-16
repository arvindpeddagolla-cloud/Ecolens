import React from 'react';
import { motion } from 'framer-motion';
import { Activity, MapPin, Camera, Sparkles } from 'lucide-react';

interface FeaturesProps {
  onSelectFeature: (tabName: string) => void;
}

export const Features: React.FC<FeaturesProps> = ({ onSelectFeature }) => {
  const list = [
    {
      id: 'dashboard',
      title: '🌱 EcoTrack AI',
      desc: 'Measure and log carbon footprints across travel, household electricity, foods, and retail shopping. Get real-time calculations and actionable carbon offset ideas.',
      points: [
        'Multi-category emissions logs (Travel, Energy, Food, Shopping)',
        'Instant carbon math powered by certified emission indices',
        'Personalized daily action lists to curb footprint growth'
      ],
      icon: Activity,
      color: 'border-emerald-500/30 text-emerald-400 shadow-emerald-950/20',
      glow: 'radial-glow-green',
      hoverClass: 'glass-card-hover'
    },
    {
      id: 'route',
      title: '🚲 GreenRoute',
      desc: 'Plan daily commutes with carbon awareness. Compare routes side-by-side: Car vs. Bus vs. Train vs. Bike vs. Walking, and witness carbon offsets in real-time.',
      points: [
        'Side-by-side comparison of 5 transportation options',
        'Visualized route pathing showing optimal green pathing',
        'Detailed metric graphs detailing exact kg CO2 saved'
      ],
      icon: MapPin,
      color: 'border-cyan-500/30 text-cyan-400 shadow-cyan-950/20',
      glow: 'radial-glow-blue',
      hoverClass: 'glass-card-blue-hover'
    },
    {
      id: 'camera',
      title: '📸 Carbon Camera',
      desc: 'Use computer vision to discover the environmental cost of products and meals. Snap or upload any receipt, food bowl, or shopping item for deep AI carbon auditing.',
      points: [
        'AI object recognition for meals, appliances, and bills',
        'Instant sustainability score grading out of 10 points',
        'Low-carbon product alternatives mapped to local options'
      ],
      icon: Camera,
      color: 'border-blue-500/30 text-blue-400 shadow-blue-950/20',
      glow: 'radial-glow-blue',
      hoverClass: 'glass-card-blue-hover'
    }
  ];

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Title Group */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-card border-slate-700/50 text-slate-300 text-xs font-semibold mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-eco-400 animate-pulse" />
            <span>Futuristic Core Modules</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Powered by Environmental Intelligence
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-md md:text-lg"
          >
            Discover three premium pillars of carbon management designed to transition your daily routine into a climate-positive force.
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {list.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              onClick={() => onSelectFeature(item.id)}
              type="button"
              aria-label={`Launch ${item.title}`}
              className={`glass-card p-8 rounded-2xl border ${item.color} relative overflow-hidden flex flex-col justify-between cursor-pointer ${item.hoverClass} shadow-xl text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
            >
              {/* Radial glow background in card */}
              <div className={`absolute -top-20 -right-20 w-44 h-44 rounded-full ${item.glow} opacity-40 blur-3xl`} />

              <div>
                {/* Icon wrapper */}
                <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center border border-white/10 mb-6 bg-slate-900/60 shadow-md">
                  <item.icon className="w-6 h-6" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  {item.title}
                </h3>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>

                {/* Checklist points */}
                <ul className="space-y-3 mb-8">
                  {item.points.map((pt, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-eco-400 mt-1.5 flex-shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-eco-400 group">
                <span>Launch Tool</span>
                <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
