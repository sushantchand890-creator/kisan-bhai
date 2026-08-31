
import React from 'react';
import { Languages, Check, Globe } from 'lucide-react';
import { Language } from '../translations';

interface LanguageToggleProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang, onLanguageChange }) => {
  const languages: { code: Language; label: string; native: string; badge: string }[] = [
    { code: 'en', label: 'English', native: 'English', badge: 'EN' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी', badge: 'हि' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', badge: 'ਪੰ' },
    { code: 'mr', label: 'Marathi', native: 'मराठी', badge: 'म' },
  ];

  const current = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="relative group z-50">
      <button 
        type="button"
        className="flex items-center gap-2.5 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-full shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200 active:scale-95 group"
      >
        <div className="w-6 h-6 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-[11px] group-hover:scale-105 transition-transform">
          {current.badge}
        </div>
        <span className="text-xs font-bold text-slate-800 tracking-wide">{current.native}</span>
        <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" />
      </button>
      
      <div className="absolute right-0 mt-2 w-52 glass-panel border border-slate-200/80 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] p-1.5 transform origin-top-right group-hover:translate-y-0 translate-y-1">
        <div className="px-3 py-1.5 mb-1 border-b border-slate-100 flex items-center gap-2">
          <Languages className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Select Language</span>
        </div>
        <div className="space-y-1">
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onLanguageChange(lang.code)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group/item ${
                  isSelected 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' 
                    : 'text-slate-700 hover:bg-brand-50/80 hover:text-brand-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover/item:bg-brand-100 group-hover/item:text-brand-700'
                  }`}>
                    {lang.badge}
                  </span>
                  <span>{lang.native}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>{lang.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

