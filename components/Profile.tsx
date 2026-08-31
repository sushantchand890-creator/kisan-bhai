
import React, { useState, useEffect } from 'react';
import { UserCircle, MapPin, Sprout, Droplets, Save, Loader2, LandPlot, Languages, CheckCircle2 } from 'lucide-react';
import { FarmProfile } from '../types';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<FarmProfile>({
    name: 'Harman Singh',
    location: 'Amritsar, Punjab',
    size: '10 Acres',
    soilType: 'Alluvial',
    primaryCrops: ['Wheat', 'Rice'],
    waterResources: 'Tubewell',
    language: 'en'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ruralassist_user');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('ruralassist_user', JSON.stringify(profile));
    setTimeout(() => {
      setIsSaving(false);
      setMessage('Farm profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }, 800);
  };

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { geminiService } = await import('../services/geminiService');
            const loc = await geminiService.reverseGeocode(position.coords.latitude, position.coords.longitude);
            if (loc && loc !== 'Unknown Location') {
              setProfile(prev => ({ ...prev, location: loc }));
            }
          } catch (e) {
            console.error(e);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLocating(false);
        },
        { timeout: 10000 }
      );
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto font-sans pb-10">
      <header className="animate-fade-in-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards] bg-white/45 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/70 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-700 shadow-xs">
              <UserCircle className="w-5 h-5" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">Farm Profile</h1>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold">Manage farm parameters, location, and language preferences.</p>
        </div>
        
        {message && (
          <div className="bg-emerald-50/90 backdrop-blur-md border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}
      </header>

      <div className="animate-fade-in-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards] bg-white/45 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-white/70 shadow-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider ml-1">Farmer Name</label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-600" />
              <input 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full bg-white/60 backdrop-blur-md focus:bg-white border border-white/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-900 font-bold outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider ml-1">Preferred Language</label>
            <div className="relative">
              <Languages className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-600" />
              <select 
                value={profile.language}
                onChange={(e) => setProfile({...profile, language: e.target.value as any})}
                className="w-full bg-white/60 backdrop-blur-md focus:bg-white border border-white/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-900 font-bold outline-none transition-all cursor-pointer"
              >
                <option value="en">English (Global)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="mr">Marathi (मराठी)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider ml-1">Location</label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-600" />
                <input 
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="w-full bg-white/60 backdrop-blur-md focus:bg-white border border-white/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-900 font-bold outline-none transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="bg-brand-50 hover:bg-brand-100 border border-brand-200/60 text-brand-800 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
                title="Auto-detect location"
              >
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-brand-600" /> : <MapPin className="w-4 h-4 text-brand-600" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider ml-1">Farm Size</label>
            <div className="relative">
              <LandPlot className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-600" />
              <input 
                value={profile.size}
                onChange={(e) => setProfile({...profile, size: e.target.value})}
                placeholder="e.g. 5 Acres"
                className="w-full bg-white/60 backdrop-blur-md focus:bg-white border border-white/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-900 font-bold outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-brand-600 via-emerald-600 to-brand-700 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-brand-600/25 active:scale-[0.98] transition-all text-sm disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Save Farmer Profile</span>
        </button>
      </div>
    </div>
  );
};

