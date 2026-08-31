import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  Truck,
  Shield,
  Sparkles,
  Store,
  X,
  Wheat,
  Tag
} from 'lucide-react';
import { AgriItem } from '../types';
import { useUser } from '../App';

const INITIAL_ITEMS: AgriItem[] = [
  {
    id: '1',
    title: 'Sharbati Premium Wheat (Grade A)',
    category: 'grains',
    price: 2450,
    unit: 'Quintal',
    sellerName: 'Gurpreet Singh',
    sellerPhone: '+91 98765 43210',
    sellerRole: 'farmer',
    location: 'Ludhiana, Punjab',
    distanceKm: 8,
    tradeType: 'farm_direct',
    quantityAvailable: '50 Quintals',
    description: '100% naturally grown Sharbati wheat freshly harvested from our 10-acre farm. Excellent grain quality and low moisture.',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    isVerifiedFarm: true,
    dateListed: '2 hours ago'
  },
  {
    id: '2',
    title: 'Fresh Red Tomatoes (Vine Ripened)',
    category: 'vegetables',
    price: 35,
    unit: 'Kg',
    sellerName: 'Ramesh Kumar',
    sellerPhone: '+91 98123 45678',
    sellerRole: 'farmer',
    location: 'Sangrur, Punjab',
    distanceKm: 14,
    tradeType: 'farm_direct',
    quantityAvailable: '600 Kg',
    description: 'Pesticide-reduced juicy red tomatoes ready for instant harvest at farm gate. Bulk pricing available.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600',
    isVerifiedFarm: true,
    dateListed: '5 hours ago'
  },
  {
    id: '3',
    title: 'Certified PR-126 Paddy Seeds (Surplus)',
    category: 'seeds',
    price: 850,
    unit: 'Bag (25kg)',
    sellerName: 'Harmanpreet Kaur',
    sellerPhone: '+91 97890 12345',
    sellerRole: 'farmer',
    location: 'Amritsar, Punjab',
    distanceKm: 22,
    tradeType: 'p2p',
    quantityAvailable: '15 Bags',
    description: 'High germination paddy seed surplus from government agriculture extension center.',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=600',
    isVerifiedFarm: true,
    dateListed: '1 day ago'
  },
  {
    id: '4',
    title: 'Pure Organic Vermicompost (Bio Fertilizer)',
    category: 'compost',
    price: 320,
    unit: 'Bag (50kg)',
    sellerName: 'Kisan Cooperative Society',
    sellerPhone: '+91 94567 89012',
    sellerRole: 'trader',
    location: 'Bathinda, Punjab',
    distanceKm: 30,
    tradeType: 'farm_direct',
    quantityAvailable: '100 Bags',
    description: 'Rich organic vermicompost packed with earthworm castings and natural minerals for healthy soil biology.',
    imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=600',
    isVerifiedFarm: true,
    dateListed: '2 days ago'
  },
  {
    id: '5',
    title: 'Alphonso Mangoes (Farm Fresh Box)',
    category: 'fruits',
    price: 650,
    unit: 'Dozen',
    sellerName: 'Sanjay Patil',
    sellerPhone: '+91 98220 11223',
    sellerRole: 'farmer',
    location: 'Ratnagiri, Maharashtra',
    distanceKm: 45,
    tradeType: 'farm_direct',
    quantityAvailable: '40 Boxes',
    description: 'Export-grade GI tagged Ratnagiri Alphonso mangoes directly shipped from orchard gates.',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600',
    isVerifiedFarm: true,
    dateListed: '3 hours ago'
  },
  {
    id: '6',
    title: 'Heavy Duty 2-Wheel Farm Trailer (Used)',
    category: 'machinery',
    price: 68000,
    unit: 'Piece',
    sellerName: 'Jasbir Singh',
    sellerPhone: '+91 98444 55667',
    sellerRole: 'farmer',
    location: 'Patiala, Punjab',
    distanceKm: 18,
    tradeType: 'p2p',
    quantityAvailable: '1 Unit',
    description: 'Heavy steel chassis tractor trailer in excellent condition. Reinforced hydraulic jack installed.',
    imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=600',
    isVerifiedFarm: false,
    dateListed: '3 days ago'
  }
];

export const AgriFarm: React.FC = () => {
  const { user } = useUser();
  const [items, setItems] = useState<AgriItem[]>(INITIAL_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTradeType, setSelectedTradeType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedItemForBuy, setSelectedItemForBuy] = useState<AgriItem | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // New Listing Form State
  const [newListing, setNewListing] = useState({
    title: '',
    category: 'grains' as AgriItem['category'],
    price: '',
    unit: 'Quintal',
    quantityAvailable: '',
    tradeType: 'farm_direct' as AgriItem['tradeType'],
    phone: '',
    location: user?.location || 'Punjab, India',
    description: '',
  });

  const categories = [
    { id: 'all', name: 'All Produce', icon: Store },
    { id: 'grains', name: 'Grains & Pulses', icon: Wheat },
    { id: 'vegetables', name: 'Fresh Vegetables', icon: ShoppingBag },
    { id: 'fruits', name: 'Orchard Fruits', icon: Sparkles },
    { id: 'seeds', name: 'Surplus Seeds', icon: Tag },
    { id: 'compost', name: 'Organic Fertilizers', icon: Shield },
    { id: 'machinery', name: 'Farm Equipment', icon: Truck },
  ];

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesTradeType = selectedTradeType === 'all' || item.tradeType === selectedTradeType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTradeType && matchesSearch;
  });

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.title || !newListing.price) return;

    const newItem: AgriItem = {
      id: Date.now().toString(),
      title: newListing.title,
      category: newListing.category,
      price: Number(newListing.price),
      unit: newListing.unit,
      sellerName: user?.name || 'Farmer Seller',
      sellerPhone: newListing.phone || '+91 98765 00000',
      sellerRole: user?.role === 'buyer' ? 'trader' : 'farmer',
      location: newListing.location,
      distanceKm: 5,
      tradeType: newListing.tradeType,
      quantityAvailable: newListing.quantityAvailable || '10 Units',
      description: newListing.description || 'Freshly listed farm produce.',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
      isVerifiedFarm: true,
      dateListed: 'Just now'
    };

    setItems([newItem, ...items]);
    setIsSellModalOpen(false);
    setNewListing({
      title: '',
      category: 'grains',
      price: '',
      unit: 'Quintal',
      quantityAvailable: '',
      tradeType: 'farm_direct',
      phone: '',
      location: user?.location || 'Punjab, India',
      description: '',
    });
  };

  const handleConfirmOrder = () => {
    setOrderConfirmed(true);
    setTimeout(() => {
      setOrderConfirmed(false);
      setSelectedItemForBuy(null);
      setOrderQuantity(1);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-800 via-emerald-800 to-teal-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
            <Store className="w-3.5 h-3.5" />
            <span>Farm-to-Farm & Direct Market</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-black leading-tight text-white">
            AgriFarm Direct Marketplace
          </h1>

          <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed">
            Buy produce directly from farm gates with zero middlemen fees, or trade surplus seeds, organic compost, and equipment with fellow farmers.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsSellModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-harvest-500 hover:bg-harvest-400 text-slate-900 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-harvest-500/30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Sell Produce / List Item</span>
            </button>

            <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/15 text-xs text-white/90 font-bold">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Direct Farm Price</span>
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-amber-300" /> Verified Sellers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="bg-white/70 backdrop-blur-2xl p-5 rounded-3xl border border-white/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search crops, produce, seeds, equipment or location..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Trade Type Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setSelectedTradeType('all')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${selectedTradeType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              All Trades
            </button>
            <button
              onClick={() => setSelectedTradeType('farm_direct')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${selectedTradeType === 'farm_direct' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              🌱 Farm Direct
            </button>
            <button
              onClick={() => setSelectedTradeType('p2p')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${selectedTradeType === 'p2p' ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              🔄 Farmer P2P
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold flex-shrink-0 transition-all ${isSelected
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 scale-[1.02]'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col overflow-hidden"
          >
            {/* Produce Image & Badges */}
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />

              {/* Trade Type Tag */}
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm text-white ${item.tradeType === 'farm_direct' ? 'bg-emerald-600/90 border border-emerald-400/40' : 'bg-brand-600/90 border border-brand-400/40'
                  }`}>
                  {item.tradeType === 'farm_direct' ? '🌱 Farm Gate Direct' : '🔄 Farmer P2P'}
                </span>
              </div>

              {/* Listed Time */}
              <div className="absolute bottom-3 left-3 text-white text-[11px] font-semibold drop-shadow-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{item.location} ({item.distanceKm} km)</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-heading font-extrabold text-base text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                </div>

                <p className="text-slate-600 text-xs line-clamp-2 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Price & Seller Info */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Price</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading text-2xl font-black text-emerald-700">₹{item.price.toLocaleString('en-IN')}</span>
                      <span className="text-xs font-bold text-slate-500">/ {item.unit}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Available</span>
                    <p className="text-xs font-extrabold text-slate-800">{item.quantityAvailable}</p>
                  </div>
                </div>

                {/* Seller Badge */}
                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                      {item.sellerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs leading-none">{item.sellerName}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5 capitalize">{item.sellerRole}</p>
                    </div>
                  </div>

                  {item.isVerifiedFarm && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${item.sellerPhone}`}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-600" />
                    <span>Call Seller</span>
                  </a>

                  <button
                    onClick={() => setSelectedItemForBuy(item)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Buy Direct</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE LISTING MODAL */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 bg-gradient-to-r from-brand-700 to-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-xl">Sell Your Farm Produce</h3>
                <p className="text-xs text-white/80 font-medium">Post crops, surplus seeds or machinery to direct buyers</p>
              </div>
              <button
                onClick={() => setIsSellModalOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Item Title / Crop Name</label>
                <input
                  required
                  value={newListing.title}
                  onChange={e => setNewListing({ ...newListing, title: e.target.value })}
                  placeholder="e.g. Fresh Organic Wheat or PR-126 Paddy Seeds"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
                  <select
                    value={newListing.category}
                    onChange={e => setNewListing({ ...newListing, category: e.target.value as AgriItem['category'] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="grains">Grains & Pulses</option>
                    <option value="vegetables">Fresh Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="seeds">Seeds & Plants</option>
                    <option value="compost">Organic Compost</option>
                    <option value="machinery">Machinery & Equipment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Trade Category</label>
                  <select
                    value={newListing.tradeType}
                    onChange={e => setNewListing({ ...newListing, tradeType: e.target.value as AgriItem['tradeType'] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="farm_direct">🌱 Direct Farm Gate</option>
                    <option value="p2p">🔄 Farmer P2P Trade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={newListing.price}
                    onChange={e => setNewListing({ ...newListing, price: e.target.value })}
                    placeholder="2450"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Unit</label>
                  <select
                    value={newListing.unit}
                    onChange={e => setNewListing({ ...newListing, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Quintal">Quintal</option>
                    <option value="Kg">Kg</option>
                    <option value="Bag">Bag</option>
                    <option value="Dozen">Dozen</option>
                    <option value="Piece">Piece</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Available Qty</label>
                  <input
                    value={newListing.quantityAvailable}
                    onChange={e => setNewListing({ ...newListing, quantityAvailable: e.target.value })}
                    placeholder="e.g. 50 Quintals"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Contact Phone</label>
                  <input
                    required
                    value={newListing.phone}
                    onChange={e => setNewListing({ ...newListing, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Farm Location</label>
                  <input
                    value={newListing.location}
                    onChange={e => setNewListing({ ...newListing, location: e.target.value })}
                    placeholder="Ludhiana, Punjab"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Description / Quality Details</label>
                <textarea
                  rows={3}
                  value={newListing.description}
                  onChange={e => setNewListing({ ...newListing, description: e.target.value })}
                  placeholder="Describe crop quality, harvest date, and pickup arrangements..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                Publish Agri-Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BUY / PLACE ORDER MODAL */}
      {selectedItemForBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-lg">Direct Farm Purchase</h3>
                <p className="text-xs text-white/80 font-medium">Order directly from {selectedItemForBuy.sellerName}</p>
              </div>
              <button
                onClick={() => setSelectedItemForBuy(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {orderConfirmed ? (
                <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="font-heading text-xl font-extrabold text-slate-900">Order Placed Successfully!</h4>
                  <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                    The seller {selectedItemForBuy.sellerName} has been notified. You can also call them directly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <img
                      src={selectedItemForBuy.imageUrl}
                      alt={selectedItemForBuy.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{selectedItemForBuy.title}</h4>
                      <p className="text-xs text-emerald-700 font-bold mt-0.5">₹{selectedItemForBuy.price} / {selectedItemForBuy.unit}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{selectedItemForBuy.location}</p>
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Quantity ({selectedItemForBuy.unit}s)</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                        className="w-10 h-10 rounded-xl bg-slate-100 font-extrabold text-slate-800 text-lg hover:bg-slate-200 transition-colors"
                      >
                        -
                      </button>
                      <span className="font-heading text-xl font-extrabold text-slate-900 w-12 text-center">{orderQuantity}</span>
                      <button
                        onClick={() => setOrderQuantity(orderQuantity + 1)}
                        className="w-10 h-10 rounded-xl bg-slate-100 font-extrabold text-slate-800 text-lg hover:bg-slate-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total Calculation */}
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">Total Price</span>
                    <span className="font-heading text-2xl font-black text-emerald-800">
                      ₹{(selectedItemForBuy.price * orderQuantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <a
                      href={`https://wa.me/${selectedItemForBuy.sellerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-700" />
                      <span>WhatsApp Seller</span>
                    </a>

                    <button
                      onClick={handleConfirmOrder}
                      className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                    >
                      <span>Confirm Order</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
