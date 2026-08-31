
import React, { useState, useEffect, useMemo } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, ShieldCheck, Info, Loader2, AlertTriangle, AlertCircle, Search, MapPin, Zap, ChevronRight } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { getTranslation } from '../translations';
import { useUser } from '../App';
import { FarmProfile } from '../types';

export const Weather: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWeatherIntelligence(user);
    }
  }, [user?.location, user?.language]);

  const fetchWeatherIntelligence = async (prof: FarmProfile) => {
    setLoading(true);
    setLoadingAlerts(true);
    try {
      const [weatherData, weatherAlerts] = await Promise.all([
        geminiService.getRealTimeWeather(prof.location, prof.language),
        geminiService.getWeatherAlerts(prof.location, prof.language)
      ]);
      
      setCurrentWeather(weatherData.current);
      setForecastData(weatherData.forecast || []);
      setAlerts(weatherAlerts || []);

      if (weatherData.current) {
        const tips = await geminiService.getWeatherAdvice(
          weatherData.current.temp, 
          weatherData.current.humidity, 
          weatherData.current.condition, 
          prof.language
        );
        setAdvice(tips);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingAlerts(false);
    }
  };

  const t = getTranslation(user?.language || 'en');

  const getWeatherIcon = (condition: string) => {
    const cond = (condition || '').toLowerCase();
    if (cond.includes('rain') || cond.includes('shower')) return CloudRain;
    if (cond.includes('cloud')) return Cloud;
    if (cond.includes('wind')) return Wind;
    return Sun;
  };

  const severityStyles = {
    'High': {
      bg: 'bg-rose-50/80',
      border: 'border-rose-200',
      text: 'text-rose-950',
      accent: 'bg-rose-600',
      icon: AlertTriangle,
      iconColor: 'text-rose-700'
    },
    'Medium': {
      bg: 'bg-amber-50/80',
      border: 'border-amber-200',
      text: 'text-amber-950',
      accent: 'bg-amber-500',
      icon: AlertCircle,
      iconColor: 'text-amber-700'
    },
    'Low': {
      bg: 'bg-blue-50/80',
      border: 'border-blue-200',
      text: 'text-blue-950',
      accent: 'bg-blue-600',
      icon: Info,
      iconColor: 'text-blue-700'
    }
  };

  const groupedAlerts = useMemo(() => {
    return alerts.reduce((acc: any, alert: any) => {
      const severity = alert.severity || 'Low';
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(alert);
      return acc;
    }, {});
  }, [alerts]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 font-sans">
      {/* HEADER BAR */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">Weather Intelligence</h1>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-1">Hyper-local weather insights & advisories for <span className="font-extrabold text-brand-700">{user?.location || 'your location'}</span>.</p>
        </div>
        <button 
          type="button"
          onClick={() => user && fetchWeatherIntelligence(user)} 
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-slate-800 px-5 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 border border-white shadow-xs"
        >
          <Zap className={`w-4 h-4 text-amber-500 ${loading ? 'animate-spin' : ''}`} /> 
          <span>Refresh Weather</span>
        </button>
      </header>

      {/* WEATHER ALERTS SECTION */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> {t.weatherAlerts} ({alerts.length})
            </h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(severityStyles).reverse().map(([severity, style]: [any, any]) => {
              const severityAlerts = groupedAlerts[severity];
              if (!severityAlerts) return null;

              const Icon = style.icon;

              return (
                <div key={severity} className="space-y-3">
                  <p className={`text-[10px] font-extrabold uppercase tracking-widest ${style.iconColor} ml-1`}>
                    {severity} Priority Alerts
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {severityAlerts.map((alert: any, i: number) => (
                      <div key={i} className={`${style.bg} border ${style.border} p-6 rounded-3xl shadow-xs relative overflow-hidden group hover:shadow-md transition-all`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 ${style.accent} rounded-2xl text-white shadow-sm`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white/70 border ${style.border} ${style.iconColor}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <h4 className={`font-heading text-lg sm:text-xl font-extrabold ${style.text} mb-2`}>{alert.title}</h4>
                        <p className={`text-xs sm:text-sm ${style.text} font-medium mb-5 opacity-90 leading-relaxed`}>{alert.description}</p>
                        
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/60 flex items-start gap-3">
                          <div className={`mt-0.5 p-1 rounded-full ${style.accent} text-white shrink-0`}>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">Recommended Action</p>
                            <p className={`text-xs sm:text-sm font-bold ${style.text}`}>{alert.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl shadow-xs border border-slate-200/80">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-600" />
          <p className="font-heading text-lg font-bold text-slate-800">Fetching Real-Time Weather...</p>
          <p className="text-xs font-medium text-slate-400 mt-1">Connecting to agricultural weather intelligence system</p>
        </div>
      ) : currentWeather ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Current Weather */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 text-blue-200 font-extrabold uppercase tracking-widest text-[10px] mb-2">
                    <MapPin className="w-3.5 h-3.5" /> {user?.location}
                  </div>
                  <h2 className="font-heading text-6xl sm:text-7xl font-extrabold tracking-tight mt-1">{currentWeather.temp}°</h2>
                  <p className="text-lg sm:text-xl text-blue-100 font-bold mt-1">{currentWeather.condition}</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full pointer-events-none" />
                  {React.createElement(getWeatherIcon(currentWeather.condition), { className: "w-20 h-20 sm:w-24 sm:h-24 text-amber-300 drop-shadow-xl relative z-10 animate-float" })}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-10 border-t border-white/15 pt-6">
                <div className="flex flex-col items-center text-center">
                  <Droplets className="w-5 h-5 mb-2 text-blue-200" />
                  <span className="text-[10px] text-blue-200/80 uppercase font-extrabold tracking-wider">{t.humidity}</span>
                  <span className="font-heading text-base sm:text-lg font-extrabold mt-0.5">{currentWeather.humidity}%</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Wind className="w-5 h-5 mb-2 text-blue-200" />
                  <span className="text-[10px] text-blue-200/80 uppercase font-extrabold tracking-wider">Wind</span>
                  <span className="font-heading text-base sm:text-lg font-extrabold mt-0.5">{currentWeather.wind} km/h</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <ShieldCheck className="w-5 h-5 mb-2 text-blue-200" />
                  <span className="text-[10px] text-blue-200/80 uppercase font-extrabold tracking-wider">UV Index</span>
                  <span className="font-heading text-base sm:text-lg font-extrabold mt-0.5">{currentWeather.uv}</span>
                </div>
              </div>
            </div>
            <Cloud className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 pointer-events-none" />
          </div>

          {/* 5-Day Forecast */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 mb-6">5-Day Forecast</h3>
            <div className="space-y-4">
              {forecastData.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-brand-50/50 hover:border-brand-200 transition-all">
                  <span className="w-14 font-extrabold text-slate-500 text-xs uppercase">{f.day}</span>
                  <div className="flex-1 flex justify-center">
                    {React.createElement(getWeatherIcon(f.condition || ''), { 
                      className: `w-6 h-6 ${f.condition?.toLowerCase().includes('rain') ? 'text-blue-500' : 'text-amber-500'}` 
                    })}
                  </div>
                  <div className="flex gap-3 w-20 justify-end text-xs font-bold">
                    <span className="text-slate-900 font-extrabold">{f.high}°</span>
                    <span className="text-slate-400">{f.low}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-3xl text-center border border-dashed border-slate-200">
           <p className="text-slate-500 font-bold text-sm">No weather data found for this location. Please update your profile location.</p>
        </div>
      )}

      {/* AI Advisory Section */}
      {!loading && advice.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-brand-900 to-emerald-900 p-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <ShieldCheck className="w-5 h-5 text-brand-300" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-white">AI Agricultural Advisory</h3>
                <p className="text-xs text-brand-100 font-medium">Kisan-Bhai's weather protection guidelines</p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid md:grid-cols-3 gap-5">
              {advice.map((tip, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-brand-300 transition-all shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-extrabold text-xs mb-3">
                    {i + 1}
                  </div>
                  <p className="text-slate-800 text-xs sm:text-sm font-semibold leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

