
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, TrendingUp, Calendar, AlertCircle, Loader2, Image as ImageIcon, CheckCircle2, Sparkles, Sprout } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { GrowthRecord } from '../types';

export const GrowthTracker: React.FC = () => {
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cropType, setCropType] = useState('Wheat');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ruralassist_growth');
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setIsAnalyzing(true);
        try {
          const analysis = await geminiService.analyzeGrowth(base64, cropType);
          const newRecord: GrowthRecord = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            image: base64,
            cropType,
            stage: analysis.stage,
            analysis: `${analysis.health}. ${analysis.analysis}. Next steps: ${analysis.nextSteps}`
          };
          const updated = [newRecord, ...records];
          setRecords(updated);
          localStorage.setItem('ruralassist_growth', JSON.stringify(updated));
        } catch (error) {
          console.error(error);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-10 font-sans">
      {/* HEADER BAR */}
      <header className="animate-fade-in-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards] bg-white/45 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/70 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-700 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">Crop Growth Ledger</h1>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold">Document crop development, track growth stages, and detect diseases early.</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className="bg-white/60 backdrop-blur-md border border-white/80 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 text-xs font-bold text-slate-800 cursor-pointer"
          >
            <option>Wheat</option>
            <option>Rice / Paddy</option>
            <option>Tomato</option>
            <option>Maize / Corn</option>
            <option>Cotton</option>
            <option>Sugarcane</option>
          </select>

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md shadow-brand-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>Upload Photo</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
        </div>
      </header>

      {/* AI ANALYSIS IN PROGRESS LOADING CARD */}
      {isAnalyzing && (
        <div className="bg-white/45 backdrop-blur-xl border border-white/70 p-8 rounded-3xl text-center flex flex-col items-center animate-pulse shadow-xl">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-3" />
          <h3 className="font-heading text-lg font-extrabold text-brand-900">AI Growth & Vision Analysis in Progress</h3>
          <p className="text-xs font-medium text-brand-700 mt-1">Identifying plant stage, leaf health, and disease symptoms...</p>
        </div>
      )}

      {/* RECORD LIST OR EMPTY STATE */}
      {records.length === 0 && !isAnalyzing ? (
        <div className="bg-white/45 backdrop-blur-xl border border-dashed border-slate-300 p-16 rounded-3xl text-center shadow-xl">
          <div className="w-14 h-14 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="font-heading text-base font-extrabold text-slate-600">No Growth Records Logged</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Take a photo of your field or crop leaves to start building your AI growth ledger.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {records.map((record) => (
            <div 
              key={record.id} 
              className="bg-white/45 backdrop-blur-xl rounded-3xl border border-white/70 shadow-md hover:shadow-xl overflow-hidden flex flex-col md:flex-row transition-all duration-200"
            >
              <div className="md:w-72 h-56 md:h-auto overflow-hidden relative shrink-0">
                <img src={record.image} className="w-full h-full object-cover" alt="Growth Record" />
                <div className="absolute top-3 left-3 bg-slate-950/60 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  {record.cropType}
                </div>
              </div>

              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold uppercase tracking-wider">{record.date}</span>
                    </div>
                    <span className="px-3 py-1 bg-brand-50 border border-brand-200/60 text-brand-700 rounded-full text-xs font-extrabold uppercase">
                      Stage: {record.stage}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-600" /> 
                    <span>{record.cropType} Health Analysis</span>
                  </h3>
                  
                  <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed bg-white/60 p-4 rounded-2xl border border-white/80 mb-4">
                    {record.analysis}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-brand-700 font-extrabold">
                    <TrendingUp className="w-4 h-4" /> 
                    <span>Growth Ledger Verified</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

