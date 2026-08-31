
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Sprout,
  Wheat,
  MessageCircle,
  Calendar,
  Cloud,
  FileText,
  Menu,
  X,
  BarChart3,
  TrendingUp,
  UserCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  MapPin,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingBag,
  Store
} from 'lucide-react';
import { getTranslation, Language } from '../translations';
import { useUser } from '../App';
import { LanguageToggle } from './LanguageToggle';

interface LayoutProps {
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  const location = useLocation();
  const { user, updateUser } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('kisan_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('kisan_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLanguageChange = (newLang: Language) => {
    if (user) {
      updateUser({ ...user, language: newLang });
    }
  };

  const lang = user?.language || 'en';
  const t = getTranslation(lang);

  const navigation = [
    { name: t.dashboard, path: '/', icon: Sprout },
    { name: t.aiAssistant, path: '/chat', icon: MessageCircle, badge: 'AI' },
    { name: t.agriFarm || 'AgriFarm Direct', path: '/agrifarm', icon: ShoppingBag, badge: 'Market' },
    { name: t.cropPlanner, path: '/planner', icon: Calendar },
    { name: t.growthTracker, path: '/growth', icon: TrendingUp },
    { name: t.weather, path: '/weather', icon: Cloud },
    { name: t.financials, path: '/profit', icon: BarChart3 },
    { name: t.schemes, path: '/schemes', icon: FileText },
    { name: t.myProfile, path: '/profile', icon: UserCircle },
  ];

  const bottomNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'AgriFarm', path: '/agrifarm', icon: ShoppingBag },
    { name: 'Kisan-AI', path: '/chat', icon: MessageCircle, isAi: true },
    { name: 'Weather', path: '/weather', icon: Cloud },
    { name: 'Schemes', path: '/schemes', icon: FileText },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const currentNav = navigation.find(item => isActive(item.path)) || { name: t.dashboard, icon: Sprout };
  const CurrentIcon = currentNav.icon;

  const activeNavIndex = navigation.findIndex(item => isActive(item.path));
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [limelightStyle, setLimelightStyle] = useState<{ top: number; height: number; ready: boolean }>({
    top: 0,
    height: 48,
    ready: false
  });

  useEffect(() => {
    const updateLimelight = () => {
      const idx = activeNavIndex >= 0 ? activeNavIndex : 0;
      const activeEl = navItemRefs.current[idx];
      if (activeEl) {
        setLimelightStyle({
          top: activeEl.offsetTop,
          height: activeEl.offsetHeight,
          ready: true
        });
      }
    };

    updateLimelight();
    const timer = setTimeout(updateLimelight, 100);
    window.addEventListener('resize', updateLimelight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLimelight);
    };
  }, [activeNavIndex, location.pathname, isSidebarCollapsed]);

  const topNavItems = [
    { path: '/agrifarm', name: 'AgriFarm', icon: ShoppingBag, title: 'AgriFarm Direct Marketplace', hiddenClass: 'flex' },
    { path: '/chat', name: 'Scan Crop', icon: Sparkles, title: 'Scan Crop Disease & Ask AI', hiddenClass: 'hidden sm:flex' },
    { path: '/schemes', name: 'Schemes', icon: FileText, title: 'View Government Schemes & Subsidies', hiddenClass: 'hidden md:flex' },
    { path: '/planner', name: 'Crop Planner', icon: Calendar, title: 'Smart Crop Season Planner', hiddenClass: 'hidden lg:flex' },
  ];

  const activeTopNavIndex = topNavItems.findIndex(item => isActive(item.path));
  const topNavRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [topNavSliderStyle, setTopNavSliderStyle] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false
  });

  useEffect(() => {
    const updateTopNavSlider = () => {
      if (activeTopNavIndex >= 0 && topNavRefs.current[activeTopNavIndex]) {
        const activeEl = topNavRefs.current[activeTopNavIndex]!;
        setTopNavSliderStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          ready: true
        });
      } else {
        setTopNavSliderStyle(prev => ({ ...prev, ready: false }));
      }
    };

    updateTopNavSlider();
    const timer = setTimeout(updateTopNavSlider, 100);
    window.addEventListener('resize', updateTopNavSlider);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTopNavSlider);
    };
  }, [activeTopNavIndex, location.pathname]);

  const NavLinks = ({ collapsed, onClick, isSidebar }: { collapsed?: boolean; onClick?: () => void; isSidebar?: boolean }) => (
    <>
      {navigation.map((item, index) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClick}
            ref={el => {
              if (isSidebar) {
                navItemRefs.current[index] = el;
              }
            }}
            title={collapsed ? item.name : undefined}
            className={`group relative flex items-center gap-3.5 px-3 py-2.5 transition-all duration-200 ${collapsed ? 'justify-center' : ''
              } ${active
                ? 'text-brand-900 font-extrabold'
                : 'text-slate-600 hover:text-brand-800 font-semibold'
              }`}
          >
            <div className={`p-2.5 rounded-2xl transition-all duration-200 ${active
                ? 'bg-gradient-to-tr from-brand-600 via-emerald-600 to-teal-600 text-white shadow-md shadow-brand-600/30 scale-105'
                : 'text-slate-500 group-hover:text-brand-700 group-hover:scale-105'
              }`}>
              <Icon className="w-5 h-5" />
            </div>

            {!collapsed && (
              <>
                <span className="text-xs tracking-wide truncate">{item.name}</span>

                {item.badge && (
                  <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${active
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-gradient-to-r from-harvest-400 to-amber-500 text-slate-900 shadow-sm'
                    }`}>
                    {item.badge}
                  </span>
                )}

                {active && !item.badge && (
                  <ChevronRight className="ml-auto w-4 h-4 text-brand-700 animate-pulse" />
                )}
              </>
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row font-sans overflow-x-hidden text-slate-900 bg-slate-900">
      {/* Background Farmland Landscape Image (Vibrant & Visible Through Cards) */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 opacity-50 pointer-events-none"
        style={{ backgroundImage: `url('/wheat_field.jpg')` }}
      />
      {/* Soft Light Translucent Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100/20 via-white/15 to-emerald-50/15 z-0 pointer-events-none backdrop-blur-[1px]" />

      {/* DESKTOP SIDEBAR (FIXED TO VIEWPORT ON SCROLL) */}
      <aside
        className={`hidden lg:flex flex-col bg-white/45 backdrop-blur-xl border-r border-white/60 fixed top-0 left-0 h-screen z-40 shadow-xl transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}
      >
        {/* Brand Header */}
        <div className={`p-4 pb-3 ${isSidebarCollapsed ? 'px-2' : ''}`}>
          <Link to="/" className={`flex items-center gap-3 group cursor-pointer ${isSidebarCollapsed ? 'justify-center p-0' : 'px-2 py-1'}`}>
            <img 
              src="/wheat_stalks.png" 
              alt="Kisan-Bhai Wheat Logo" 
              className={`object-contain filter drop-shadow-md flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isSidebarCollapsed ? 'w-14 h-14 scale-125' : 'w-12 h-12'
              }`} 
            />
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-heading font-extrabold text-base text-slate-900 leading-none truncate group-hover:text-brand-700 transition-colors">Kisan-Bhai</h1>
                  <Sparkles className="w-3.5 h-3.5 text-harvest-500 fill-harvest-400 flex-shrink-0" />
                </div>
                <p className="text-[10px] font-extrabold text-brand-700 tracking-wider mt-1 uppercase truncate">
                  {t.smartFarming}
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Links with Limelight Active Height Slide Effect */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar relative">
          {/* Animated Limelight Height Slide Indicator Bar */}
          <div 
            className={`absolute left-0.5 w-1.5 bg-gradient-to-b from-brand-400 via-emerald-500 to-teal-400 rounded-r-full shadow-[0_0_15px_#16a34a] z-20 pointer-events-none transition-all duration-300 ease-in-out ${
              limelightStyle.ready ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              top: `${limelightStyle.top}px`, 
              height: `${limelightStyle.height}px` 
            }}
          >
            {/* Limelight Spotlight Beam (Polygon Clip-Path) */}
            <div className="absolute left-0 top-0 w-64 h-full [clip-path:polygon(0_15%,100%_0,100%_100%,0_85%)] bg-gradient-to-r from-brand-500/30 via-emerald-500/10 to-transparent pointer-events-none" />
          </div>

          {!isSidebarCollapsed && (
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
              Main Navigation
            </p>
          )}
          <NavLinks collapsed={isSidebarCollapsed} isSidebar={true} />
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 mt-auto border-t border-white/50">
          <div className={`bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm ${isSidebarCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3.5'
            }`}>
            {isSidebarCollapsed ? (
              <>
                <div
                  title={user?.name || 'Farmer'}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-sm"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  title="Log Out"
                  className="w-10 h-10 bg-white/80 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name || t.guest}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-brand-600 flex-shrink-0" />
                      <span className="truncate">{user?.location || 'India'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full bg-white/80 text-slate-700 text-xs font-bold py-2.5 rounded-xl border border-slate-200/80 flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className={`flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 relative z-10 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}>
        {/* STICKY TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-30 bg-white/45 backdrop-blur-xl border-b border-white/60 px-4 py-3 lg:px-6 flex items-center justify-between shadow-xs">

          {/* Left Controls: Sidebar Toggle & Active Page Badge */}
          <div className="flex items-center gap-3">
            {/* Desktop Sidebar Hide/Unhide Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 bg-white/80 hover:bg-white text-slate-700 rounded-xl transition-all shadow-xs items-center gap-1.5 active:scale-95 border border-white/80"
              title={isSidebarCollapsed ? "Unhide Sidebar" : "Hide Sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-brand-700" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Mobile Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 lg:hidden cursor-pointer group">
              <img 
                src="/wheat_stalks.png" 
                alt="Kisan-Bhai Wheat Logo" 
                className="w-12 h-12 object-contain filter drop-shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform" 
              />
              <div>
                <h1 className="font-heading font-extrabold text-base text-slate-900 leading-none group-hover:text-brand-700 transition-colors">Kisan-Bhai</h1>
                <p className="text-[9px] font-bold text-brand-600 tracking-wider uppercase mt-0.5">RuralAssist AI</p>
              </div>
            </Link>

            {/* Active Route Breadcrumb Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/80 text-slate-800 text-xs font-bold shadow-xs">
              <CurrentIcon className="w-3.5 h-3.5 text-brand-600" />
              <span>{currentNav.name}</span>
            </div>
          </div>

          {/* Center/Right Action Tools: Quick Features & Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Top Navigation Sliding Active Pill Container (WITHOUT light/spotlight beam) */}
            <div className="relative flex items-center gap-1.5 p-1 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-xs overflow-hidden">
              {/* Smooth Horizontal Slider Pill */}
              <div 
                className={`absolute top-1 bottom-1 bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 rounded-xl shadow-md transition-all duration-300 ease-out z-10 ${
                  topNavSliderStyle.ready ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  left: `${topNavSliderStyle.left}px`,
                  width: `${topNavSliderStyle.width}px`
                }}
              />

              {topNavItems.map((item, idx) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    ref={el => { topNavRefs.current[idx] = el; }}
                    className={`relative z-20 items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition-colors duration-200 ${item.hiddenClass || 'flex'} ${
                      active 
                        ? 'text-white font-extrabold' 
                        : 'text-slate-700 hover:text-slate-900 font-bold'
                    }`}
                    title={item.title}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-brand-700'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Multi-lingual Selector */}
            <LanguageToggle currentLang={lang} onLanguageChange={handleLanguageChange} />

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 bg-white/80 hover:bg-white rounded-xl text-slate-700 transition-colors border border-white/80 shadow-xs"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT ROUTER OUTLET */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-2 py-2 flex items-center justify-around shadow-lg">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.isAi) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative -top-4 flex flex-col items-center group"
              >
                <div className={`w-13 h-13 rounded-2xl bg-gradient-to-tr from-brand-600 via-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-brand-600/30 transition-transform active:scale-90 ${active ? 'ring-4 ring-brand-200 scale-105' : ''
                  }`}>
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold text-brand-700 mt-1">Kisan-AI</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${active ? 'text-brand-600 font-bold' : 'text-slate-500 font-medium hover:text-slate-800'
                }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-brand-600 scale-110' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-1 tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* MOBILE FULL NAVIGATION OVERLAY DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-50">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-md">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-extrabold text-lg text-slate-900">All Modules</h2>
                  <p className="text-[10px] font-bold text-brand-600 tracking-wider uppercase">RuralAssist Navigation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
              <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
            </nav>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full bg-rose-50 text-rose-600 font-bold py-3.5 rounded-2xl border border-rose-200/80 flex items-center justify-center gap-2 hover:bg-rose-100 transition-all shadow-xs"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};


