import React, { useState } from 'react';
import type { CameraAnalysisResult } from '../services/mockServices';
import { mockGeminiAI, mockFirestore } from '../services/mockServices';
import { CameraDropzone } from './CameraDropzone';
import { ScanResultsPanel } from './ScanResultsPanel';

interface CarbonCameraTabProps {
  onLogAdded: () => void;
}

export const CarbonCameraTab: React.FC<CarbonCameraTabProps> = ({ onLogAdded }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [analysisResult, setAnalysisResult] = useState<CameraAnalysisResult | null>(null);
  const [loggedAlert, setLoggedAlert] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const runScanSimulation = (fileName: string, imgDataUrl?: string) => {
    setIsScanning(true);
    setAnalysisResult(null);
    setLoggedAlert(false);
    
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

  const handleImageSelected = (fileName: string, dataUrl: string) => {
    setImagePreview(dataUrl);
    runScanSimulation(fileName, dataUrl);
  };

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

    mockFirestore.addLog(
      cat as 'travel' | 'energy' | 'food' | 'shopping',
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
            
            {/* Case A: No preview yet */}
            {!imagePreview && (
              <CameraDropzone onImageSelected={handleImageSelected} />
            )}

            {/* Case B: Image Preview and Scan Sweep */}
            {imagePreview && (
              <div className="flex-grow flex flex-col items-center justify-center relative p-2">
                <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-white/10 bg-slate-950/40">
                  <img 
                    src={imagePreview} 
                    alt="Scanned item preview" 
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
              </div>
            )}

          </div>
        </div>

        {/* Scan Results Panel */}
        <ScanResultsPanel
          isScanning={isScanning}
          scanStatus={scanStatus}
          analysisResult={analysisResult}
          isLogging={isLogging}
          loggedAlert={loggedAlert}
          handleLogItem={handleLogItem}
          handleReset={handleReset}
        />

      </div>
    </div>
  );
};
export default CarbonCameraTab;
