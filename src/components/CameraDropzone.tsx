import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface CameraDropzoneProps {
  onImageSelected: (fileName: string, dataUrl: string) => void;
}

export const CameraDropzone: React.FC<CameraDropzoneProps> = ({ onImageSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onImageSelected(file.name, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6">
      <div
        role="button"
        tabIndex={0}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload image"
        className={`w-full flex-grow border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-12 px-6 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-emerald-400 bg-emerald-500/5'
            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
        } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div aria-hidden="true" className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
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
              type="button"
              onClick={() => onImageSelected(demo.name, demo.image)}
              className="flex items-center gap-2 p-2 rounded-xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 hover:border-white/10 text-left transition-colors text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <img src={demo.image} alt={`Template preview for ${demo.label}`} className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-slate-300 truncate">{demo.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default CameraDropzone;
