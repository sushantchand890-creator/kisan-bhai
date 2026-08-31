
import React, { useState, useEffect } from 'react';
import { FileText, Search, Tag, Users, CheckCircle, ExternalLink, Loader2, Landmark, ChevronRight, X } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useUser } from '../App';

export const Schemes: React.FC = () => {
  const { user } = useUser();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const data = await geminiService.getSchemes(user?.location || 'India', user?.language || 'en');
        setSchemes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [user?.language, user?.location]);

  const filteredSchemes = schemes.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 font-sans">
      {/* HEADER BAR */}
      <header className="bg-white/45 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/70 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">Government Schemes</h1>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold">Discover active government subsidies, financial assistance & crop insurance.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search schemes by keyword..."
            className="w-full bg-white/60 backdrop-blur-md focus:bg-white border border-white/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium outline-none transition-all"
          />
        </div>
      </header>

      {/* SCHEME CARDS GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/45 backdrop-blur-xl rounded-3xl border border-white/70 shadow-xl">
          <Loader2 className="w-10 h-10 animate-spin mb-3 text-brand-600" />
          <p className="font-heading text-base font-extrabold text-slate-800">Searching Active Agricultural Schemes...</p>
          <p className="text-xs font-medium text-slate-400 mt-1">Fetching live government records for {user?.location || 'India'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme, i) => (
            <div 
              key={i} 
              className="bg-white/45 backdrop-blur-xl rounded-3xl border border-white/70 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div className="p-6 sm:p-8 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-brand-50 text-brand-700 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    scheme.category?.toLowerCase().includes('subsidy') ? 'bg-blue-50 text-blue-700 border border-blue-200/60' :
                    scheme.category?.toLowerCase().includes('insurance') ? 'bg-purple-50 text-purple-700 border border-purple-200/60' :
                    'bg-harvest-50 text-harvest-800 border border-harvest-200/60'
                  }`}>
                    {scheme.category || 'Government Scheme'}
                  </span>
                </div>

                <h3 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 mb-2">{scheme.name}</h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-6 line-clamp-2 leading-relaxed">{scheme.description}</p>
                
                <div className="space-y-3.5 border-t border-white/60 pt-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3 text-brand-600" /> Eligibility
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 font-semibold">{scheme.eligibility}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-brand-600" /> Benefits
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 font-semibold">{scheme.benefits}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/60 backdrop-blur-md border-t border-white/70 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedScheme(scheme)}
                  className="flex-1 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 text-xs active:scale-95"
                >
                  <span>Apply & Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && filteredSchemes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-heading font-extrabold text-base text-slate-600">No Schemes Matched</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Try adjusting your search terms.</p>
        </div>
      )}

      {/* SCHEME DETAIL MODAL */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedScheme(null)} />
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl z-10 border border-slate-200 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedScheme(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-50 text-brand-700 rounded-2xl">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 block">Active Portal</span>
                <h2 className="font-heading font-extrabold text-xl text-slate-900">{selectedScheme.name}</h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {selectedScheme.description}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">Eligibility Requirements</h4>
                <p className="text-xs sm:text-sm text-slate-800 font-semibold">{selectedScheme.eligibility}</p>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">Financial Benefits</h4>
                <p className="text-xs sm:text-sm text-slate-800 font-semibold">{selectedScheme.benefits}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href="https://pmkisan.gov.in" 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-extrabold py-3.5 rounded-xl text-xs text-center shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

