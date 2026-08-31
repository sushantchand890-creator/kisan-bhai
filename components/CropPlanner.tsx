
import React, { useState } from 'react';
import { Calendar, Search, MapPin, Wind, Sprout, Loader2, Sparkles, Droplets, Target, TrendingUp, ShieldCheck } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useUser } from '../App';

export const CropPlanner: React.FC = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    location: user?.location || 'Punjab, India',
    season: 'Kharif (June-Oct)',
    soil: 'Alluvial'
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const result = await geminiService.getCropRecommendations(formData.location, formData.season, formData.soil, user?.language || 'en');
      setRecommendations(result.crops || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 font-sans">
      <header className="bg-white/45 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/70 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-700 shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">Smart Crop Planner</h1>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold">Discover optimal crop varieties based on location, season, and soil parameters.</p>
        </div>
      </header>

      <div className="bg-white/45 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/70 shadow-xl space-y-6">
        <h2 className="font-heading text-lg font-extrabold text-slate-900 border-b border-white/60 pb-4">
          Regional Parameters
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-600" /> Location
            </label>
            <input 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g. Punjab, India"
              className="w-full bg-white/60 backdrop-blur-md focus:bg-white border border-white/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-600" /> Season
            </label>
            <select 
              value={formData.season}
              onChange={(e) => setFormData({...formData, season: e.target.value})}
              className="w-full bg-white/60 backdrop-blur-md focus:bg-white border border-white/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold outline-none transition-all cursor-pointer"
            >
              <option>Kharif (June-Oct)</option>
              <option>Rabi (Oct-March)</option>
              <option>Zaid (March-June)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-brand-600" /> Soil Type
            </label>
            <select 
              value={formData.soil}
              onChange={(e) => setFormData({...formData, soil: e.target.value})}
              className="w-full bg-white/60 backdrop-blur-md focus:bg-white border border-white/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold outline-none transition-all cursor-pointer"
            >
              <option>Alluvial</option>
              <option>Black (Regur)</option>
              <option>Red & Yellow</option>
              <option>Laterite</option>
              <option>Desert/Sandy</option>
            </select>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-brand-600 via-emerald-600 to-brand-700 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-brand-600/25 active:scale-[0.98] transition-all text-sm disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Generate Smart Crop Recommendations</span>
            </>
          )}
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="animate-in slide-in-from-bottom duration-300 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Sparkles className="w-5 h-5 fill-amber-400" />
            </div>
            <h2 className="font-heading text-xl font-extrabold text-slate-900">Recommended Crops for Your Field</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.map((crop, i) => (
              <div 
                key={i} 
                className="group bg-white/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/70 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="h-32 bg-gradient-to-br from-brand-50/80 via-emerald-50/60 to-teal-50/60 p-6 flex items-center justify-center border-b border-white/60">
                  <div className="bg-white/80 backdrop-blur-md p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform text-brand-600">
                    <Sprout className="w-10 h-10" />
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-2xl font-extrabold text-slate-900 mb-4">{crop.name}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-brand-600" /> Risk Level
                        </span>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                          crop.risk?.toLowerCase().includes('low') 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}>
                          {crop.risk}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-brand-600" /> Profit Potential
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 uppercase">{crop.profitPotential}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <Droplets className="w-4 h-4 text-blue-600" /> Water Need
                        </span>
                        <span className="text-xs font-extrabold text-blue-700 uppercase">{crop.waterNeed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

