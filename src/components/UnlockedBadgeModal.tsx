import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronRight } from 'lucide-react';

interface UnlockedBadgeModalProps {
  unlockedBadgeName: string | null;
  onClose: () => void;
}

export const UnlockedBadgeModal: React.FC<UnlockedBadgeModalProps> = ({
  unlockedBadgeName,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {unlockedBadgeName && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass-card border border-emerald-500/30 p-8 rounded-3xl text-center max-w-sm relative shadow-2xl bg-slate-900/90"
          >
            <button
              onClick={onClose}
              aria-label="Close achievement modal"
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div
              aria-hidden="true"
              className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg animate-bounce"
              style={{ animationDuration: '3s' }}
            >
              🏆
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/15 mb-3 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              <span>Achievement Unlocked</span>
            </div>

            <h4 className="text-xl font-extrabold text-white mb-2 leading-tight">
              {unlockedBadgeName}
            </h4>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Congratulations! Your ecological score and carbon reduction accomplishments have earned you top-tier credentials.
            </p>

            <button
              onClick={onClose}
              className="glass-btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <span>Awesome, Thank You!</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default UnlockedBadgeModal;
