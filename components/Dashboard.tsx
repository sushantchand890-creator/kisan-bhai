
import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, 
  Droplets, 
  Thermometer, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  FlaskConical, 
  Sprout, 
  Camera, 
  Waves,
  Calendar,
  FileText,
  ShieldAlert,
  ChevronRight,
  Sun,
  ShoppingBag
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { useUser } from '../App';
import { getTranslation } from '../translations';
import { FarmProfile } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [aiAlerts, setAiAlerts] = useState<any[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [realStats, setRealStats] = useState({
    temp: '...',
    humidity: '...',
    moisture: '42%',
    growth: '+12%'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchAlerts(user);
      fetchLiveWeatherForStats(user);
    }
  }, [user?.language, user?.location]);

  const fetchLiveWeatherForStats = async (prof: FarmProfile) => {
    try {
      const weather = await geminiService.getRealTimeWeather(prof.location, prof.language);
      if (weather.current) {
        setRealStats(prev => ({
          ...prev,
          temp: `${weather.current.temp}°C`,
          humidity: `${weather.current.humidity}%`
        }));
      }
    } catch (e: any) {
      console.error("Stats fetch failed", e);
    }
  };

  const fetchAlerts = async (prof: FarmProfile) => {
    setIsLoadingAlerts(true);
    try {
      const alerts = await geminiService.getProactiveAlerts(prof);
      setAiAlerts(alerts);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setIsScanning(true);
        try {
          const result = await geminiService.analyzeDisease(base64, user.language);
          navigate('/chat', { state: { initialImage: base64, initialPrompt: `I scanned my crop and found: ${result.diseaseName}. Severity is ${result.severity}. Tell me more about how to treat it.` } });
        } catch (error: any) {
          console.error(error);
          alert("Could not analyze image. Try again.");
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const t = getTranslation(user?.language || 'en');

  const stats = [
    { label: t.soilMoisture, value: realStats.moisture, icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200/60' },
    { label: t.airTemp, value: realStats.temp, icon: Thermometer, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200/60' },
    { label: t.humidity, value: realStats.humidity, icon: Cloud, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200/60' },
    { label: t.growthIndex, value: realStats.growth, icon: Sprout, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-200/60' },
  ];

  return (
    <div className="space-y-8 pb-10 font-sans">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-2xl flex items-center justify-center border border-white/40 shadow-md shadow-brand-600/20 text-white shrink-0">
              <Sprout className="w-9 h-9" />
           </div>
           <div>
             <div className="flex items-center gap-2">
               <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                 {t.welcome}, {user?.name || 'Farmer'}!
               </h1>
               <span className="text-xl">🌾</span>
             </div>
             <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-1">
               {t.kisanBhaiAnalyzing} in <span className="font-extrabold text-brand-700">{user?.location || 'your area'}</span>.
             </p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleScan} accept="image/*" className="hidden" />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-extrabold text-white bg-gradient-to-r from-brand-600 via-emerald-600 to-brand-700 px-6 py-3.5 rounded-2xl shadow-lg shadow-brand-600/25 hover:from-brand-500 hover:to-emerald-500 transition-all active:scale-95 disabled:opacity-50"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>{t.scanCropHealth}</span>
          </button>
        </div>
      </header>

      {/* STATS METRIC CARDS (Frosted Glass) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="bg-white/70 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-white/80 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider">{stat.label}</span>
              <div className={`w-10 h-10 ${stat.bg} border rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: HERO AI INSIGHTS & GROWTH */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI FARMER INSIGHTS CARD */}
          <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-brand-700/50">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-harvest-300">
                    <Sparkles className="w-5 h-5 fill-harvest-300" />
                  </div>
                  <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white">
                    {t.aiFarmerInsights}
                  </h2>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 bg-white/15 rounded-full border border-white/20 text-brand-100">
                  Live Stream
                </span>
              </div>

              {isLoadingAlerts ? (
                <div className="flex items-center gap-3 py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-300" />
                  <span className="font-semibold text-brand-100 text-sm">{t.observingSkies}</span>
                </div>
              ) : aiAlerts.length > 0 ? (
                <div className="space-y-4 mt-6">
                  {aiAlerts.map((alert, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 transition-all hover:bg-white/15">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          alert.urgency === 'High' 
                            ? 'bg-rose-500/20 text-rose-200 border-rose-400/30' 
                            : 'bg-harvest-500/20 text-harvest-200 border-harvest-400/30'
                        }`}>
                          {alert.type} • {alert.urgency}
                        </span>
                      </div>
                      <p className="font-heading font-extrabold text-lg sm:text-xl text-white mb-1">{alert.title}</p>
                      <p className="text-xs sm:text-sm text-brand-100/90 font-medium leading-relaxed">{alert.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 py-8 px-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-brand-100 text-sm font-semibold">{t.fieldsPeaceful}</p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Link 
                  to="/chat" 
                  className="inline-flex items-center gap-2 bg-white hover:bg-brand-50 text-brand-900 px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  <span>{t.talkToKisanBhai}</span>
                  <ArrowRight className="w-4 h-4 text-brand-700" />
                </Link>
                <Link 
                  to="/planner" 
                  className="inline-flex items-center gap-2 bg-emerald-600/80 hover:bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm border border-emerald-400/40 shadow-md transition-all active:scale-95"
                >
                  <span>{t.cropPlanner}</span>
                  <Calendar className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <TrendingUp className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 pointer-events-none" />
          </div>

          {/* CROP GROWTH PROGRESS CARD */}
          <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-700 shadow-xs">
                  <Sprout className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900">{t.growthProgress}</h3>
              </div>
              <Link to="/growth" className="text-brand-700 text-xs font-bold uppercase tracking-wider hover:text-brand-800 flex items-center gap-1">
                <span>{t.viewFullHistory}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-white/80 hover:border-brand-300 transition-all shadow-xs">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-600 shadow-sm border border-slate-100 shrink-0">
                  <Sprout className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-extrabold text-sm sm:text-base text-slate-900">{t.wheatPlotA}</p>
                  <p className="text-xs text-slate-500 font-medium truncate">{t.nextStageBooting}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-lg font-extrabold text-brand-600">82%</p>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                    {t.healthy}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RISK MONITOR & QUICK ACTIONS */}
        <div className="space-y-8">
          
          {/* RISK MONITOR CARD */}
          <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900">{t.riskMonitor}</h3>
            </div>

            <div className="space-y-3.5">
              <div className="p-4 bg-rose-50/80 backdrop-blur-md rounded-2xl border border-rose-200/80 shadow-xs">
                <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider mb-1 block">
                  {t.localPestWarning}
                </span>
                <p className="text-xs text-rose-950 font-bold leading-snug">{t.locustDesc}</p>
              </div>

              <div className="p-4 bg-amber-50/80 backdrop-blur-md rounded-2xl border border-amber-200/80 shadow-xs">
                <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider mb-1 block">
                  Weather Advisory
                </span>
                <p className="text-xs text-amber-950 font-bold leading-snug">Monitor upcoming rainfall patterns for optimal harvest timing.</p>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS TILES */}
          <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl">
            <h3 className="font-heading font-extrabold text-lg text-slate-900 mb-6">{t.quickActions}</h3>
            
            <div className="grid grid-cols-2 gap-3.5">
              <Link 
                to="/agrifarm" 
                className="col-span-2 p-4 bg-gradient-to-r from-emerald-600 via-brand-700 to-teal-800 text-white rounded-2xl flex items-center justify-between hover:shadow-lg transition-all group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-5 h-5 text-harvest-300" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block text-white">AgriFarm Direct Market</span>
                    <span className="text-[10px] text-white/80 font-medium">Buy or sell produce directly from farm gate</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80" />
              </Link>

              <Link 
                to="/planner" 
                className="p-4 bg-white/60 hover:bg-white backdrop-blur-md rounded-2xl text-center transition-all border border-white/80 group shadow-xs hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 block tracking-tight">{t.cropPlanner}</span>
              </Link>

              <Link 
                to="/profit" 
                className="p-4 bg-white/60 hover:bg-white backdrop-blur-md rounded-2xl text-center transition-all border border-white/80 group shadow-xs hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 block tracking-tight">{t.financials}</span>
              </Link>

              <Link 
                to="/growth" 
                className="p-4 bg-white/60 hover:bg-white backdrop-blur-md rounded-2xl text-center transition-all border border-white/80 group shadow-xs hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Sprout className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 block tracking-tight">{t.growthTracker}</span>
              </Link>

              <Link 
                to="/schemes" 
                className="p-4 bg-white/60 hover:bg-white backdrop-blur-md rounded-2xl text-center transition-all border border-white/80 group shadow-xs hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 block tracking-tight">{t.schemes}</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

