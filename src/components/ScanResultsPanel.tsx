import React from 'react';
import { Sparkles, Check, ChevronRight, RefreshCw } from 'lucide-react';
import type { CameraAnalysisResult } from '../services/mockServices';

interface ScanResultsPanelProps {
  isScanning: boolean;
  scanStatus: string;
  analysisResult: CameraAnalysisResult | null;
  isLogging: boolean;
  loggedAlert: boolean;
  handleLogItem: (alternativeName?: string, altSubCategory?: string) => void;
  handleReset: () => void;
}

export const ScanResultsPanel: React.FC<ScanResultsPanelProps> = ({
  isScanning,
  scanStatus,
  analysisResult,
  isLogging,
  loggedAlert,
  handleLogItem,
  handleReset
}) => {
  return (
    <div className="lg:col-span-7 flex flex-col justify-between">
      <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl flex-grow flex flex-col justify-center min-h-[400px]">
        {/* Case A: Scan is active */}
        {isScanning && (
          <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center animate-pulse">
            <div aria-hidden="true" className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 rotate-12">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h4 className="text-md font-bold text-white mb-2">Analyzing Image</h4>
              <p className="text-xs text-slate-400 leading-normal max-w-xs">{scanStatus}</p>
            </div>
          </div>
        )}

        {/* Case B: Static placeholder before scan starts */}
        {!isScanning && !analysisResult && (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div aria-hidden="true" className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-md font-bold text-slate-400">Scanner Analysis Panel</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-normal">
                Upload or drop an image on the left, or try a demo template to generate real-time carbon offsets.
              </p>
            </div>
          </div>
        )}

        {/* Case C: Scan is complete, show parsed result */}
        {!isScanning && analysisResult && (
          <div className="space-y-6">
            
            {/* Header / Stats Summary */}
            <div className="flex justify-between items-start border-b border-slate-800/80 pb-5">
              <div>
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-0.5 rounded-full inline-block mb-2 select-none">
                  Detected Item
                </span>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {analysisResult.itemName}
                </h3>
                <span className="text-xs text-slate-400 font-semibold block mt-0.5">
                  Category: {analysisResult.category} • Subcategory: {analysisResult.detectedSubCategory}
                </span>
              </div>

              <div className="text-right">
                <span className="text-2xl font-extrabold text-rose-400 block leading-tight">
                  +{analysisResult.carbonFootprint}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
                  kg CO₂ footprint
                </span>
              </div>
            </div>

            {/* Score pill indicator */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-slate-900/40 text-xs">
              <span className="font-bold text-slate-300">AI Sustainability Rating:</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className={`text-sm ${analysisResult.sustainabilityScore >= 7 ? 'text-emerald-400' : analysisResult.sustainabilityScore >= 5 ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {analysisResult.sustainabilityScore} / 10
                </span>
                <span className="text-slate-500">
                  ({analysisResult.sustainabilityScore >= 7 ? 'Eco-Friendly' : analysisResult.sustainabilityScore >= 5 ? 'Moderate' : 'High carbon'})
                </span>
              </div>
            </div>

            {/* Carbon Green Alternatives */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Smart Climate Alternatives</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysisResult.alternatives.map((alt, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-200 leading-snug">{alt.name}</span>
                        <span className="text-[9px] text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 whitespace-nowrap">
                          -{alt.savingsPercent}% CO₂
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal mb-3 font-medium">
                        {alt.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLogItem(alt.name, alt.subCategory)}
                      disabled={isLogging}
                      className="glass-btn-primary py-1 px-3 text-[10px] font-bold flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      <Check className="w-3 h-3" />
                      <span>Log Alternative</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* General Tips */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Eco Coach Tips</span>
              <ul className="list-disc pl-4 text-[10px] text-slate-400 space-y-1">
                {analysisResult.generalTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
            </div>

            {/* Action buttons (Footer) */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleLogItem()}
                disabled={isLogging}
                className="glass-btn-primary flex-grow py-2.5 text-xs font-bold flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {isLogging ? (
                  <span>Logging...</span>
                ) : loggedAlert ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Logged Successfully!</span>
                  </>
                ) : (
                  <>
                    <span>Log Scanned Item ({analysisResult.carbonFootprint} kg)</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-12 h-10 rounded-xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/50"
                title="Scan another photo"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
};
export default ScanResultsPanel;
