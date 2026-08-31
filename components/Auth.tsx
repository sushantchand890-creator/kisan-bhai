import React, { useState, useEffect } from 'react';
import { Sprout, Wheat, LogIn, UserPlus, Loader2, Landmark, MapPin, Sparkles, ShieldCheck, Sun, Speech, ArrowRight } from 'lucide-react';
import { FarmProfile } from '../types';
import { geminiService } from '../services/geminiService';

interface AuthProps {
  onAuth: (user: FarmProfile) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [autoLocation, setAutoLocation] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer' as 'farmer' | 'buyer' | 'both',
  });

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const loc = await geminiService.reverseGeocode(position.coords.latitude, position.coords.longitude);
            if (loc && loc !== 'Unknown Location') {
              setAutoLocation(loc);
            }
          } catch (e) {
            console.error("Geocoding error:", e);
          }
        },
        (error) => console.error("Geolocation error:", error),
        { timeout: 10000 }
      );
    }
  }, []);

  const detectLocationAndAuth = async (baseProfile: Partial<FarmProfile>) => {
    setLoading(true);
    let finalLocation = autoLocation || 'Punjab, India';

    if (!autoLocation && 'geolocation' in navigator) {
      setLoadingText('Detecting farm location...');
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        const loc = await geminiService.reverseGeocode(position.coords.latitude, position.coords.longitude);
        if (loc && loc !== 'Unknown Location') {
          finalLocation = loc;
          setAutoLocation(loc);
        }
      } catch (e) {
        console.error("Failed to detect location during auth", e);
      }
    }

    setLoadingText('Setting up your Agri-Account...');

    setTimeout(() => {
      const newUser: FarmProfile = {
        name: baseProfile.name || 'Farmer',
        location: finalLocation,
        size: baseProfile.size || '5 Acres',
        soilType: baseProfile.soilType || 'Alluvial',
        primaryCrops: baseProfile.primaryCrops || ['Wheat'],
        waterResources: baseProfile.waterResources || 'Tubewell',
        language: baseProfile.language || 'en',
        role: formData.role || 'farmer',
        isGuest: baseProfile.isGuest || false
      };
      onAuth(newUser);
      setLoading(false);
      setLoadingText('');
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    detectLocationAndAuth({
      name: formData.name || 'Farmer',
    });
  };

  const handleGuest = () => {
    detectLocationAndAuth({
      name: 'Guest Farmer',
      size: 'Not Set',
      soilType: 'Not Set',
      primaryCrops: [],
      waterResources: 'Not Set',
      isGuest: true
    });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      {/* Bright, Crisp Wheat Field Landscape Background Image (No dark overlay) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url('/wheat_field.jpg')` }}
      />
      
      {/* Very light contrast gradient for text clarity without dimming sky */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/15 z-0 pointer-events-none" />

      {/* Main Grid Container */}
      <div className="relative z-10 w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 max-w-[1600px] mx-auto p-4 sm:p-8 lg:p-12 items-center">
        
        {/* Left Side Hero Content */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between h-full py-8 pr-12 relative">
          <div>
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-white/30 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold mb-8 shadow-md">
              <Wheat className="w-4 h-4 text-emerald-400" />
              <span className="uppercase tracking-wider">RuralAssist AI Platform</span>
            </div>
            
            {/* Bright Hero Heading matching reference */}
            <h1 className="font-heading text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
              Kisan-Bhai <br />
              <span className="text-emerald-400">Digital Farmer </span> <br />
              <span className="text-emerald-200">Advisor</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base lg:text-lg text-white font-medium max-w-xl leading-relaxed drop-shadow-md">
              Empowering farmers with AI-driven crop diagnostics, real-time weather advisories, multilingual voice support, and government scheme navigation.
            </p>
          </div>

          {/* 4 Glass Feature Badges Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-xl mt-12">
            <div className="bg-emerald-950/45 border border-white/30 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3.5 shadow-lg">
              <div className="p-3 bg-white/20 rounded-xl text-emerald-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading text-white font-bold text-sm">Crop Disease AI</h4>
                <p className="text-white/80 text-xs font-medium">Gemini Vision Analysis</p>
              </div>
            </div>

            <div className="bg-emerald-950/45 border border-white/30 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3.5 shadow-lg">
              <div className="p-3 bg-white/20 rounded-xl text-emerald-300">
                <Speech className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading text-white font-bold text-sm">Multilingual Voice</h4>
                <p className="text-white/80 text-xs font-medium">Hindi, Punjabi & Marathi</p>
              </div>
            </div>

            <div className="bg-emerald-950/45 border border-white/30 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3.5 shadow-lg">
              <div className="p-3 bg-white/20 rounded-xl text-emerald-300">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading text-white font-bold text-sm">Smart Advisory</h4>
                <p className="text-white/80 text-xs font-medium">Weather & Crop Insights</p>
              </div>
            </div>

            <div className="bg-emerald-950/45 border border-white/30 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3.5 shadow-lg">
              <div className="p-3 bg-white/20 rounded-xl text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading text-white font-bold text-sm">Offline Support</h4>
                <p className="text-white/80 text-xs font-medium">Fallback Q&A ready</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Glass Card Container (Light, translucent frosted glass matching screenshot) */}
        <div className="col-span-1 lg:col-span-5 flex items-center justify-center">
          <div className="w-full max-w-md bg-white/40 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-10 transition-all text-slate-900">
            
            {/* Logo Icon & Header */}
            <div className="flex flex-col items-center mb-6 text-center">
              <img 
                src="/wheat_logo.png" 
                alt="Kisan-Bhai Wheat Logo" 
                className="w-14 h-14 rounded-full object-contain mb-3 filter drop-shadow-md transition-transform duration-300 hover:scale-105" 
              />
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight transition-all duration-300">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-700 text-xs sm:text-sm font-semibold mt-1 transition-all duration-300">
                {isLogin ? 'Sign in to manage your farm & crops' : 'Join Kisan-Bhai to empower your farm'}
              </p>
            </div>

            {/* Login / Sign Up Pill Tabs with Smooth Animated Background Slider */}
            <div className="relative flex p-1 bg-black/10 backdrop-blur-md border border-white/40 rounded-2xl mb-6 overflow-hidden">
              {/* Sliding Pill Indicator */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-md transition-all duration-300 ease-out ${
                  isLogin ? 'left-1' : 'left-[calc(50%+2px)]'
                }`}
              />
              
              <button 
                type="button"
                onClick={() => setIsLogin(true)}
                className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors duration-300 ${
                  isLogin 
                    ? 'text-slate-900' 
                    : 'text-slate-700 hover:text-slate-950 font-bold'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                <span>Log In</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setIsLogin(false)}
                className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors duration-300 ${
                  !isLogin 
                    ? 'text-slate-900' 
                    : 'text-slate-700 hover:text-slate-950 font-bold'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Auth Form with Smooth Field Collapsing */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Role Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider ml-1">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl shadow-xs">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'farmer' })}
                    className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all duration-200 ${
                      formData.role === 'farmer' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-700 hover:text-slate-950 font-bold'
                    }`}
                  >
                    🌾 Sell Produce
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'buyer' })}
                    className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all duration-200 ${
                      formData.role === 'buyer' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-700 hover:text-slate-950 font-bold'
                    }`}
                  >
                    🛒 Direct Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'both' })}
                    className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all duration-200 ${
                      formData.role === 'both' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-700 hover:text-slate-950 font-bold'
                    }`}
                  >
                    🔄 Both
                  </button>
                </div>
              </div>

              {/* Animated Height Expansion Container for Full Name */}
              <div className={`grid transition-all duration-300 ease-in-out ${
                !isLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}>
                <div className="overflow-hidden space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider ml-1">
                    Full Name
                  </label>
                  <input 
                    required={!isLogin}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-500 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="farmer@example.com"
                  className="w-full bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-500 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider ml-1">
                  Password
                </label>
                <input 
                  required
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-500 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
                />
              </div>

              {/* Green Primary CTA Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all duration-300 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{loadingText || 'Loading...'}</span>
                  </div>
                ) : isLogin ? (
                  <div className="flex items-center gap-2 animate-in fade-in duration-200">
                    <span>Enter Your Farm</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 animate-in fade-in duration-200">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </form>

            {/* OR Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-900/15" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white/80 backdrop-blur-md px-3 py-0.5 text-slate-700 font-extrabold rounded-full border border-white shadow-xs">
                  OR
                </span>
              </div>
            </div>

            {/* Guest Secondary CTA Button */}
            <button 
              type="button"
              onClick={handleGuest}
              disabled={loading}
              className="w-full bg-white/60 hover:bg-white/80 backdrop-blur-md border border-white/80 text-slate-900 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-xs disabled:opacity-50 shadow-xs"
            >
              <Landmark className="w-4 h-4 text-slate-800" />
              <span>Continue as Guest</span>
            </button>

            {/* Auto-Detected Location */}
            {autoLocation && (
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-900 bg-white/70 backdrop-blur-md border border-white/80 py-1.5 px-3 rounded-full w-max mx-auto shadow-xs">
                <MapPin className="w-3 h-3 text-emerald-700" />
                <span>Detected: {autoLocation}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};




