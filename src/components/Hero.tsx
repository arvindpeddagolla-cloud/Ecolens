import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Leaf, ArrowRight, Play } from 'lucide-react';

interface HeroProps {
  onStartTracking: () => void;
  onWatchDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartTracking, onWatchDemo }) => {
  const [leaves] = useState(() =>
    Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 90 + 5, // random horizontal position
      delay: Math.random() * 10,
      scale: Math.random() * 0.6 + 0.5,
      speed: Math.random() * 6 + 10, // animation speed in seconds
    }))
  );

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 py-12 md:py-24">
      {/* Background Gradients and Glowing Elements */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full radial-glow-green opacity-40 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full radial-glow-blue opacity-30 blur-[100px]" />
      
      {/* Background grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Floating Leaf Particles */}
      {leaves.map((leaf) => (
        <span
          key={leaf.id}
          className="leaf-particle"
          style={{
            left: `${leaf.left}%`,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.speed}s`,
            transform: `scale(${leaf.scale})`,
          }}
        >
          <Leaf className="w-5 h-5 fill-eco-500/20 text-eco-400" />
        </span>
      ))}

      <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Content Column */}
        <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-eco-500/20 text-eco-400 text-sm font-medium mb-6"
          >
            <Compass className="w-4 h-4 animate-spin-slow text-eco-400" />
            <span>AI-Powered Sustainability v2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent"
          >
            Track Your Impact. <br />
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Build a Greener Future.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed font-normal text-center lg:text-left"
          >
            AI-powered platform helping individuals understand, track, and reduce their carbon footprint.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <button
              type="button"
              onClick={onStartTracking}
              className="glass-btn-primary group flex items-center justify-center gap-2 w-full sm:w-auto px-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <span>Go Green Today 🌱</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            
            <button
              type="button"
              onClick={onWatchDemo}
              className="glass-btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto px-8 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
            >
              <Play className="w-4 h-4 fill-slate-200 text-slate-200" />
              <span>Watch Demo</span>
            </button>
          </motion.div>
        </div>

        {/* Right 3D Earth Column */}
        <div aria-hidden="true" className="lg:col-span-5 flex justify-center items-center relative py-10 lg:py-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: 'spring' }}
            className="relative w-72 h-72 sm:w-96 sm:h-96"
          >
            {/* Atmospheric Outer Glow */}
            <div className="absolute inset-0 rounded-full earth-glow animate-pulse-slow" />
            
            {/* Spinning Earth Container */}
            <div className="absolute inset-2 bg-gradient-to-br from-indigo-950 via-blue-900 to-emerald-950 rounded-full overflow-hidden border border-slate-700/50">
              {/* Spinning continents overlay */}
              <div 
                className="absolute inset-0 opacity-50 bg-repeat-x animate-spin-slow"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80")',
                  backgroundSize: '200% 100%',
                  backgroundBlendMode: 'overlay',
                }}
              />
              
              {/* Earth Shadow/Shading Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-transparent to-white/20 pointer-events-none" />
              
              {/* Bio grid ring overlay */}
              <div className="absolute inset-4 rounded-full border border-eco-500/20 border-dashed animate-spin" style={{ animationDuration: '60s' }} />
              <div className="absolute inset-10 rounded-full border border-cyber-500/10 animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
            </div>

            {/* Glowing environmental orbit rings */}
            <div className="absolute -inset-6 rounded-full border border-emerald-500/10 pointer-events-none rotate-12 scale-x-[1.2]" />
            <div className="absolute -inset-10 rounded-full border border-cyan-500/5 pointer-events-none -rotate-12 scale-x-[1.3]" />

            {/* Micro badges floating around Earth */}
            <div className="absolute top-10 right-4 w-12 h-12 rounded-full glass-card flex items-center justify-center animate-float-slow shadow-lg border-emerald-500/30">
              <span className="text-xl">🌱</span>
            </div>
            <div className="absolute bottom-12 -left-6 w-14 h-14 rounded-full glass-card flex items-center justify-center animate-float-medium shadow-lg border-cyan-500/30">
              <span className="text-2xl">🚲</span>
            </div>
            <div className="absolute bottom-4 right-10 w-10 h-10 rounded-full glass-card flex items-center justify-center animate-float-slow shadow-lg border-blue-500/20" style={{ animationDelay: '1.5s' }}>
              <span className="text-lg">🌍</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
