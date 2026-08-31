
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Calculator, DollarSign, PieChart, Info, Loader2, Sparkles, TrendingUp, IndianRupee } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useUser } from '../App';

export const ProfitSimulator: React.FC = () => {
  const { user } = useUser();
  const [inputs, setInputs] = useState({
    landSize: 5,
    cropType: 'Wheat',
    seedsCost: 2000,
    laborCost: 5000,
    fertilizerCost: 3000,
    marketPrice: 2200,
    expectedYield: 25,
  });
  const [loading, setLoading] = useState(false);

  const fetchEstimates = async () => {
    setLoading(true);
    try {
      const data = await geminiService.getFinancialEstimates(
        inputs.landSize,
        inputs.cropType,
        user?.location || 'India',
        user?.language || 'en'
      );
      setInputs(prev => ({
        ...prev,
        seedsCost: data.seedsCost || 0,
        laborCost: data.laborCost || 0,
        fertilizerCost: data.fertilizerCost || 0,
        expectedYield: data.expectedYield || 0,
        marketPrice: data.marketPrice || 0,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [inputs.landSize, inputs.cropType, user?.location, user?.language]);

  const totalCost = (inputs.seedsCost + inputs.laborCost + inputs.fertilizerCost) * inputs.landSize;
  const totalRevenue = inputs.expectedYield * inputs.marketPrice * inputs.landSize;
  const totalProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  const chartData = [
    { name: 'Seeds', value: inputs.seedsCost * inputs.landSize, fill: '#16a34a' },
    { name: 'Labor', value: inputs.laborCost * inputs.landSize, fill: '#2563eb' },
    { name: 'Fertilizer', value: inputs.fertilizerCost * inputs.landSize, fill: '#d97706' },
  ];

  return (
    <div className="space-y-8 pb-10 font-sans">
      {/* HEADER BAR */}
      <header className="animate-fade-in-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards] bg-white/45 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/70 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-700 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">Yield & Profit Simulator</h1>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold">Estimate crop cost, expected yield, and net profit before planting.</p>
        </div>
      </header>

      <div className="animate-fade-in-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards] grid lg:grid-cols-2 gap-8">
        {/* INPUTS CARD */}
        <div className="bg-white/45 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/70 shadow-xl space-y-6">
          <div className="flex items-center justify-between mb-2 text-brand-800 bg-brand-50/80 border border-brand-200/60 p-3.5 rounded-2xl font-extrabold text-xs">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand-600" /> 
              <span>Farm Parameters</span>
            </div>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-brand-600" />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider ml-1">Land Size (Acres)</label>
              <input 
                type="number"
                min="1"
                max="500"
                value={inputs.landSize}
                onChange={(e) => setInputs({...inputs, landSize: Number(e.target.value)})}
                className="w-full bg-white/60 backdrop-blur-md focus:bg-white border border-white/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider ml-1">Crop Type</label>
              <select 
                value={inputs.cropType}
                onChange={(e) => setInputs({...inputs, cropType: e.target.value})}
                className="w-full bg-white/60 backdrop-blur-md focus:bg-white border border-white/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold outline-none transition-all cursor-pointer"
              >
                <option>Wheat</option>
                <option>Rice / Paddy</option>
                <option>Sugarcane</option>
                <option>Maize / Corn</option>
                <option>Cotton</option>
                <option>Soybean</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/60 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                <div className="bg-white border border-brand-200 px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-xs font-extrabold text-brand-700 animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Estimating regional mandi costs...</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> AI Regional Market Estimates (Per Acre)
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Seeds Cost (₹)</label>
                <input 
                  type="number"
                  value={inputs.seedsCost}
                  readOnly
                  className="w-full bg-white/50 border border-white/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold outline-none cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Labor Cost (₹)</label>
                <input 
                  type="number"
                  value={inputs.laborCost}
                  readOnly
                  className="w-full bg-white/50 border border-white/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold outline-none cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Expected Yield (qtl/acre)</label>
                <input 
                  type="number"
                  value={inputs.expectedYield}
                  readOnly
                  className="w-full bg-white/50 border border-white/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold outline-none cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Market Price (₹/qtl)</label>
                <input 
                  type="number"
                  value={inputs.marketPrice}
                  readOnly
                  className="w-full bg-white/50 border border-white/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS & CHARTS COLUMN */}
        <div className="space-y-6">
          <div className="bg-white/45 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/70 shadow-xl">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" /> Cost Distribution
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/45 backdrop-blur-xl p-5 rounded-3xl border border-white/70 shadow-md">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Total Investment</span>
              <p className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900">₹{totalCost.toLocaleString()}</p>
            </div>
            
            <div className={`p-5 rounded-3xl border shadow-md ${
              totalProfit >= 0 
                ? 'bg-gradient-to-br from-brand-600 via-emerald-600 to-teal-700 text-white border-brand-500 shadow-brand-600/20' 
                : 'bg-gradient-to-br from-rose-600 to-rose-700 text-white border-rose-500 shadow-rose-600/20'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">Net Profit ({marginPercent}%)</span>
              </div>
              <p className="font-heading text-xl sm:text-2xl font-extrabold">₹{totalProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50/70 backdrop-blur-md border border-blue-200/60 p-5 rounded-3xl flex items-start gap-3.5">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-950 font-semibold leading-relaxed">
          <strong>Market Disclaimer:</strong> These financial estimates are calculated using real-time mandi prices and average cost metrics. Weather variations, pest risks, and local market fluctuations may influence actual yields.
        </p>
      </div>
    </div>
  );
};

