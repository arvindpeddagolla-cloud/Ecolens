import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  ChevronRight,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import type { CameraAnalysisResult } from '../services/mockServices';
import { mockGeminiAI, mockFirestore } from '../services/mockServices';

interface CarbonCameraTabProps {
  onLogAdded: () => void;
}

export const CarbonCameraTab: React.FC<CarbonCameraTabProps> = ({ onLogAdded }) => {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [analysisResult, setAnalysisResult] = useState<CameraAnalysisResult | null>(null);
  const [loggedAlert, setLoggedAlert] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-configured demo templates
  const demoTemplates = [
    { name: 'Electric Bill.jpg', label: '⚡ Utility Bill', image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=300&q=80' },
    { name: 'Water Bottle.jpg', label: '🥤 Plastic Bottle', image: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=300&q=80' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      runScanSimulation(file.name, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectDemo = (name: string, imageUrl: string) => {
    setImagePreview(imageUrl);
    runScanSimulation(name, imageUrl);
  };

  // Run the scanning & Gemini logic
  const runScanSimulation = (fileName: string, imgDataUrl?: string) => {
    setIsScanning(true);
    setAnalysisResult(null);
    setLoggedAlert(false);
    
    // Status text rotators during scan
    const statuses = [
      'Reading pixels with computer vision...',
      'Initializing Gemini vision engine...',
      'Recognizing objects and packaging...',
      'Estimating lifecycle CO2 parameters...',
      'Formulating green alternatives...',
    ];
    
    let currentIdx = 0;
    setScanStatus(statuses[0]);
    
    const statusInterval = setInterval(() => {
      currentIdx = (currentIdx + 1) % statuses.length;
      setScanStatus(statuses[currentIdx]);
    }, 500);

    mockGeminiAI.analyzeImage(fileName, imgDataUrl).then((result) => {
      clearInterval(statusInterval);
      setIsScanning(false);
      setAnalysisResult(result);
    });
  };

  // Log scanned item
  const handleLogItem = (alternativeName?: string, altSubCategory?: string) => {
    if (!analysisResult) return;
    setIsLogging(true);

    const logName = alternativeName || analysisResult.itemName;
    const cat = analysisResult.category.toLowerCase().includes('food') 
      ? 'food' 
      : analysisResult.category.toLowerCase().includes('energy') 
        ? 'energy' 
        : 'shopping';
        
    const finalSub = altSubCategory || analysisResult.detectedSubCategory;

    // Simulate database write
    mockFirestore.addLog(
      cat as any,
      `AI Camera: logged ${logName}`,
      1,
      cat === 'food' ? 'meal' : 'item',
      finalSub
    );

    setTimeout(() => {
      setIsLogging(false);
      setLoggedAlert(true);
      onLogAdded();
      setTimeout(() => setLoggedAlert(false), 3000);
    }, 1000);
  };

  const handleReset = () => {
    setImagePreview(null);
    setAnalysisResult(null);
    setLoggedAlert(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Dynamic Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upload & Scanning Left Box */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl flex-grow flex flex-col justify-between h-full min-h-[400px]">
            
            <AnimatePresence mode="wait">
              {/* State 1: Upload Dropzone */}
              {!imagePreview && (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-grow flex flex-col items-center justify-center p-6"
                >
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full flex-grow border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-12 px-6 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-emerald-400 bg-emerald-500/5'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
                      <Upload className="w-6 h-6" />
                    </div>
                    
                    <h4 className="text-md font-bold text-white mb-2">Drag & Drop Image</h4>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                      Upload photos of meals, shopping products, or utility bills to calculate their environmental impact.
                    </p>
                    <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded-md mt-4 border border-cyan-500/10">
                      Supports JPG, PNG up to 10MB
                    </span>
                  </div>

                  {/* Demo template selector */}
                  <div className="w-full mt-6">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-3">Or test with demo templates</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {demoTemplates.map((demo) => (
                        <button
                          key={demo.name}
                          onClick={() => handleSelectDemo(demo.name, demo.image)}
                          className="flex items-center gap-2 p-2 rounded-xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 hover:border-white/10 text-left transition-colors text-xs font-semibold"
                        >
                          <img src={demo.image} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-slate-300 truncate">{demo.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* State 2: Image Preview and Scan Sweep */}
              {imagePreview && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-grow flex flex-col items-center justify-center relative p-2"
                >
                  <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-white/10 bg-slate-950/40">
                    <img 
                      src={imagePreview} 
                      alt="Scanned item" 
                      className="w-full h-full object-cover select-none"
                    />

                    {/* Green scanning beam */}
                    {isScanning && (
                      <>
                        <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] scanner-line pointer-events-none" />
                      </>
                    )}

                    {/* Glow overlay for completed scan */}
                    {analysisResult && (
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
                    )}
                  </div>

                  {/* Scanning Status overlay */}
                  {isScanning && (
                    <div className="w-full text-center mt-6">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>AI Scanning in progress...</span>
                      </div>
                      <span className="text-slate-400 text-xs mt-1 block font-medium">
                        {scanStatus}
                      </span>
                    </div>
                  )}

                  {/* Back button */}
                  {analysisResult && (
                    <button
                      onClick={handleReset}
                      className="mt-6 glass-btn-secondary py-2 px-5 text-xs font-bold flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scan Another Photo</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>

        {/* AI Analysis Results Right Box */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass-card p-12 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center h-full min-h-[400px]"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6 animate-pulse">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Analyzing Footprint...</h3>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                  EcoLens AI is calculating carbon density values. We match ingredients and logistics cycles with standard EPA emissions databases.
                </p>
              </motion.div>
            ) : analysisResult ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                
                {/* Result Card Header */}
                <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
                  
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/80 pb-5 mb-5">
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/10 uppercase tracking-widest">
                        {analysisResult.category}
                      </span>
                      <h3 className="text-2xl font-bold text-white mt-2 leading-tight">
                        {analysisResult.itemName}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right select-none">
                      <span className="text-3xl font-extrabold text-rose-400">
                        {analysisResult.carbonFootprint.toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-xs ml-1 font-bold">kg CO₂</span>
                      <span className="text-xs text-slate-500 font-bold block mt-0.5">Est. carbon output</span>
                    </div>
                  </div>

                  {/* Sustainability score scale */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2">
                      <span>SUSTAINABILITY GRADE</span>
                      <span className={`${
                        analysisResult.sustainabilityScore >= 7 ? 'text-emerald-400' : analysisResult.sustainabilityScore >= 4 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {analysisResult.sustainabilityScore} / 10
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          analysisResult.sustainabilityScore >= 7 
                            ? 'bg-emerald-400' 
                            : analysisResult.sustainabilityScore >= 4 
                              ? 'bg-amber-400' 
                              : 'bg-rose-400'
                        }`}
                        style={{ width: `${analysisResult.sustainabilityScore * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Greener Alternatives */}
                <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Recommended Greener Alternatives</h4>
                  </div>

                  <div className="space-y-4">
                    {analysisResult.alternatives.map((alt) => (
                      <div 
                        key={alt.name} 
                        className="p-4 rounded-2xl border border-emerald-500/10 bg-emerald-950/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-500/30 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white block">{alt.name}</span>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <TrendingDown className="w-3 h-3" />
                              <span>{alt.savingsPercent}% lower</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-md">
                            {alt.description}
                          </p>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 border-t md:border-t-0 border-slate-800/80 pt-3.5 md:pt-0">
                          <div className="text-left md:text-right">
                            <span className="text-xs font-bold text-slate-200">{alt.carbonFootprint}</span>
                            <span className="text-[10px] text-slate-400 font-bold ml-1">kg CO₂</span>
                          </div>
                          
                          <button
                            onClick={() => handleLogItem(alt.name, alt.subCategory)}
                            disabled={isLogging}
                            className="glass-btn-primary py-1.5 px-3.5 text-[10px] font-bold flex items-center gap-1 shadow-md shadow-emerald-950/10"
                          >
                            <span>Adopt & Log</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips & Actions List */}
                <div className="glass-card p-6.5 rounded-3xl border border-white/5 shadow-xl">
                  <h4 className="text-sm font-bold text-white mb-3">AI Insights & Action Plan</h4>
                  <ul className="space-y-3">
                    {analysisResult.generalTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Logger for default item */}
                  <div className="border-t border-slate-800/80 mt-6 pt-5 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Did you consume/buy this exact scanned item?</span>
                    
                    <AnimatePresence mode="wait">
                      {loggedAlert ? (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
                        >
                          <Check className="w-4 h-4" />
                          <span>Logged to Dashboard!</span>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => handleLogItem()}
                          disabled={isLogging}
                          className="glass-btn-secondary py-2 px-4.5 text-[11px] font-bold border border-white/10 hover:bg-slate-800/60"
                        >
                          {isLogging ? 'Logging...' : 'Log Scanned Impact'}
                        </button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center h-full min-h-[400px]"
              >
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-6">
                  <Camera className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Scan Result Terminal</h3>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                  Upload an image on the left, or select a demo shortcut template, to view the AI carbon audit reports.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
