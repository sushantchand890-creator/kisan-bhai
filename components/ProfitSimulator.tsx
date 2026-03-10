
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Calculator, DollarSign, PieChart, Info, Loader2, Sparkles } from 'lucide-react';
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

  const chartData = [
    { name: 'Seeds', value: inputs.seedsCost * inputs.landSize, fill: '#10b981' },
    { name: 'Labor', value: inputs.laborCost * inputs.landSize, fill: '#3b82f6' },
    { name: 'Fertilizer', value: inputs.fertilizerCost * inputs.landSize, fill: '#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Yield & Profit Simulator</h1>
        <p className="text-gray-500">Estimate your potential returns before you plant.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-4 text-green-700 bg-green-50 p-3 rounded-2xl font-medium">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" /> Investment Inputs
            </div>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Land Size (Acres)</label>
              <input 
                type="number"
                value={inputs.landSize}
                onChange={(e) => setInputs({...inputs, landSize: Number(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Crop Type</label>
              <select 
                value={inputs.cropType}
                onChange={(e) => setInputs({...inputs, cropType: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option>Wheat</option>
                <option>Rice</option>
                <option>Sugarcane</option>
                <option>Maize</option>
                <option>Cotton</option>
                <option>Soybean</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-sm font-bold text-green-600">
                  <Sparkles className="w-4 h-4 animate-pulse" /> Auto-estimating...
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-500" /> AI Auto-Estimated Values (per Acre)
            </div>
            <div className="grid grid-cols-2 gap-4 opacity-80">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Seeds Cost (₹)</label>
                <input 
                  type="number"
                  value={inputs.seedsCost}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 outline-none text-gray-600 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Labor Cost (₹)</label>
                <input 
                  type="number"
                  value={inputs.laborCost}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 outline-none text-gray-600 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Expected Yield (qtl/acre)</label>
                <input 
                  type="number"
                  value={inputs.expectedYield}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 outline-none text-gray-600 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Market Price (₹/qtl)</label>
                <input 
                  type="number"
                  value={inputs.marketPrice}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 outline-none text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" /> Cost Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalCost.toLocaleString()}</p>
            </div>
            <div className={`p-6 rounded-3xl border shadow-lg ${totalProfit >= 0 ? 'bg-green-600 border-green-500 text-white shadow-green-200' : 'bg-red-600 border-red-500 text-white shadow-red-200'}`}>
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Estimated Net Profit</p>
              <p className="text-2xl font-bold">₹{totalProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex gap-4">
        <Info className="w-6 h-6 text-blue-600 shrink-0" />
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>Note:</strong> These estimates are based on real-time market data and your inputs. Actual figures may vary due to weather fluctuations, unforeseen pest outbreaks, or market volatility. Use these figures as a planning guideline.
        </p>
      </div>
    </div>
  );
};
