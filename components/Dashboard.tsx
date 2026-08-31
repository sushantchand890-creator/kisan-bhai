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
  Sprout, 
  Camera, 
  Calendar,
  FileText,
  ShieldAlert,
  ChevronRight,
  Sun,
  ShoppingBag,
  Store,
  Newspaper,
  CloudRain,
  MapPin,
  Tag,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Phone
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
    temp: '28°C',
    humidity: '65%',
    moisture: '42%',
    growth: '+12%',
    condition: 'Partly Cloudy'
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
          humidity: `${weather.current.humidity}%`,
          condition: weather.current.condition || 'Partly Cloudy'
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

  // Featured AgriFarm Listings for Dashboard Showcase
  const featuredAgriItems = [
    {
      title: 'Sharbati Premium Wheat (Grade A)',
      price: '₹2,450 / qtl',
      seller: 'Gurpreet Singh',
      location: 'Ludhiana, Punjab',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400',
      tag: '🌱 Farm Direct'
    },
    {
      title: 'Vine-Ripened Red Tomatoes',
      price: '₹35 / kg',
      seller: 'Ramesh Kumar',
      location: 'Sangrur, Punjab',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400',
      tag: '🌱 Farm Direct'
    },
    {
      title: 'Certified PR-126 Paddy Seeds',
      price: '₹1,800 / bag',
      seller: 'Harpreet Kaur',
      location: 'Patiala, Punjab',
      image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=400',
      tag: '🔄 Farmer P2P'
    }
  ];

  // Daily Market Price Tickers
  const mandiRates = [
    { crop: 'Sharbati Wheat', rate: '₹2,450/qtl', change: '+2.4%', up: true },
    { crop: 'Fresh Tomato', rate: '₹35/kg', change: '-1.2%', up: false },
    { crop: 'PR-126 Paddy', rate: '₹2,200/qtl', change: '+0.8%', up: true },
    { crop: 'Mustard Seeds', rate: '₹5,650/qtl', change: '+3.1%', up: true },
    { crop: 'Yellow Maize', rate: '₹2,100/qtl', change: '0.0%', up: true }
  ];

  // Daily Ag News
  const dailyNews = [
    {
      title: 'Cabinet Approves MSP Hikes for Rabi Crops Season 2026-27',
      source: 'AgriNews India',
      time: '3 hours ago',
      category: 'Policy & Prices'
    },
    {
      title: 'PM-KUSUM Solar Pump Subsidy Extended to 50,000 Additional Farmers',
      source: 'Ministry of Agriculture',
      time: '6 hours ago',
      category: 'Subsidies'
    },
    {
      title: 'IMD Predicts Timely Pre-Monsoon Showers in Northern Belt',
      source: 'Weather Desk',
      time: '12 hours ago',
      category: 'Climate'
    }
  ];

  return (
    <div className="space-y-8 pb-10 font-sans">

      {/* DAILY MANDI MARKET TICKER BANNER */}
      <div className="bg-white/70 backdrop-blur-2xl px-4 py-3 rounded-2xl border border-white/80 shadow-md flex items-center justify-between gap-4 overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-extrabold text-brand-900 shrink-0 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200/60">
          <TrendingUp className="w-4 h-4 text-brand-600" />
          <span>DAILY MANDI RATES</span>
        </div>
        
        <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar py-1 text-xs">
          {mandiRates.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0 bg-white/60 px-3 py-1 rounded-xl border border-slate-200/60">
              <span className="font-bold text-slate-800">{item.crop}:</span>
              <span className="font-black text-slate-900">{item.rate}</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                item.up ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

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

      {/* AGRIFARM DIRECT MARKETPLACE SPOTLIGHT */}
      <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-md shadow-emerald-600/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900">AgriFarm Direct Market Spotlight</h2>
              <p className="text-xs text-slate-500 font-semibold">Buy directly from farm gates or trade surplus with fellow farmers</p>
            </div>
          </div>
          
          <Link 
            to="/agrifarm" 
            className="hidden sm:flex items-center gap-1.5 text-xs font-extrabold text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2.5 rounded-xl border border-brand-200/60 transition-all active:scale-95"
          >
            <span>Explore All Listings</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* PRODUCE CARDS GRID */}
        <div className="grid md:grid-cols-3 gap-5">
          {featuredAgriItems.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col group"
            >
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/20">
                  {item.tag}
                </span>
                <span className="absolute bottom-3 right-3 bg-emerald-600 text-white font-extrabold text-xs px-3 py-1 rounded-xl shadow-md">
                  {item.price}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 leading-snug line-clamp-1">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">Seller: {item.seller}</p>
                </div>

                <Link 
                  to="/agrifarm" 
                  className="w-full bg-slate-900 hover:bg-brand-700 text-white text-xs font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <span>Buy Direct</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: HERO AI INSIGHTS & WEATHER WIDGET */}
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
                  Live Advisory
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

          {/* REAL-TIME WEATHER FORECAST & IRRIGATION ADVISORY WIDGET */}
          <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500 rounded-2xl text-white shadow-md shadow-blue-500/20">
                  <CloudRain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900">Weather & Irrigation Advisory</h3>
                  <p className="text-xs text-slate-500 font-semibold">Live weather report for {user?.location || 'your area'}</p>
                </div>
              </div>
              <Link to="/weather" className="text-brand-700 text-xs font-bold uppercase tracking-wider hover:text-brand-800 flex items-center gap-1">
                <span>Full Forecast</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Today */}
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 p-4 rounded-2xl border border-blue-200/60 flex items-center gap-3">
                <Sun className="w-8 h-8 text-amber-500 shrink-0" />
                <div>
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">Today</span>
                  <p className="font-heading text-lg font-black text-slate-900">{realStats.temp}</p>
                  <p className="text-[11px] text-slate-600 font-semibold">{realStats.condition}</p>
                </div>
              </div>

              {/* Tomorrow Forecast */}
              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/60 p-4 rounded-2xl border border-emerald-200/60 flex items-center gap-3">
                <CloudRain className="w-8 h-8 text-teal-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">Tomorrow</span>
                  <p className="font-heading text-lg font-black text-slate-900">25°C • 70% Rain</p>
                  <p className="text-[11px] text-emerald-800 font-bold">Rain Expected</p>
                </div>
              </div>

              {/* Day 3 Forecast */}
              <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/60 p-4 rounded-2xl border border-amber-200/60 flex items-center gap-3">
                <Cloud className="w-8 h-8 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">Day 3</span>
                  <p className="font-heading text-lg font-black text-slate-900">27°C • Clear</p>
                  <p className="text-[11px] text-slate-600 font-semibold">Mild Breeze</p>
                </div>
              </div>
            </div>

            {/* Smart Irrigation Advisory Strip */}
            <div className="p-4 bg-teal-50/80 backdrop-blur-md rounded-2xl border border-teal-200/80 flex items-start gap-3">
              <Zap className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-extrabold text-teal-900 block">Smart Irrigation Recommendation</span>
                <p className="text-xs text-teal-800 font-medium leading-relaxed mt-0.5">
                  Precipitation expected tomorrow afternoon. Postpone tonight's scheduled watering to prevent root rot and save energy.
                </p>
              </div>
            </div>
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

        {/* RIGHT COLUMN: DAILY AG NEWS, RISK MONITOR & QUICK ACTIONS */}
        <div className="space-y-8">
          
          {/* DAILY AGRICULTURAL NEWS FEED CARD */}
          <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-xs">
                  <Newspaper className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900">Daily Agri-News & Briefs</h3>
              </div>
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">Live</span>
            </div>

            <div className="space-y-3.5">
              {dailyNews.map((news, idx) => (
                <div key={idx} className="p-3.5 bg-white/60 hover:bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 transition-all cursor-pointer shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold text-brand-700 uppercase tracking-wider">{news.category}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{news.time}</span>
                  </div>
                  <p className="text-xs text-slate-900 font-bold leading-snug hover:text-brand-700 transition-colors">{news.title}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Source: {news.source}</p>
                </div>
              ))}
            </div>
          </div>

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
