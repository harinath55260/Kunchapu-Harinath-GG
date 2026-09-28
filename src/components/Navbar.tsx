import React, { useState } from 'react';
import {
  Globe,
  Search,
  PlusCircle,
  Bookmark,
  User as UserIcon,
  Shield,
  LogOut,
  Menu,
  X,
  Compass,
  MapPin,
  LayoutDashboard,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenShareModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAndroidModal?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenShareModal,
  onOpenAuthModal,
  onOpenAndroidModal,
  searchQuery,
  onSearchChange
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-serif">
                  Go<span className="text-amber-400">Global</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded">
                  Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block tracking-wide">
                Explore the World. Share Your Culture.
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cultures, countries, traditions (e.g. Japan, Tea, Samba)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onNavigate('home');
                }}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-full pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Primary Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'bg-amber-500/15 text-amber-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>
            {user && (
              <button
                onClick={() => onNavigate('profile')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'profile'
                    ? 'bg-amber-500/15 text-amber-300 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                User Dashboard
              </button>
            )}
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2">
            
            {/* PWA Install Button */}
            <PWAInstallButton onOpenAndroidModal={onOpenAndroidModal} />

            {/* Android App Button */}
            {onOpenAndroidModal && (
              <button
                onClick={onOpenAndroidModal}
                title="Download GoGlobal Native Android App (APK / AAB)"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 transition-all shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android App</span>
              </button>
            )}

            {/* Share Your Culture Button (Centerpiece CTA) */}
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuthModal();
                } else {
                  onOpenShareModal();
                }
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-md shadow-rose-600/20 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Share Culture</span>
              <span className="sm:hidden">Share</span>
            </button>

            {/* User Account / Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-amber-500/50 transition-all"
                >
                  {user.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs border border-slate-700">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="font-semibold text-white truncate">{user.displayName}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                        isAdmin
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {isAdmin ? 'Role: Administrator' : 'Role: Contributor'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5"
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-400" />
                      User Dashboard
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('saved');
                      }}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5"
                    >
                      <Bookmark className="w-4 h-4 text-rose-400" />
                      Saved Collection
                    </button>

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-1.5 text-sm font-semibold rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile Search Toggle */}
            <button
              onClick={() => {
                setShowMobileSearch(!showMobileSearch);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (showMobileSearch) setShowMobileSearch(false);
              }}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Row (Toggled via search icon) */}
        {showMobileSearch && (
          <div className="md:hidden pb-3 pt-1 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search cultures, countries, traditions..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onNavigate('home');
                    setShowMobileSearch(false);
                    document.getElementById('youtube-cultural-feed')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-full pl-10 pr-9 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Mobile Search Bar & Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cultures, countries, traditions..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onNavigate('home');
                    setMobileMenuOpen(false);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className="col-span-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 text-left flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-amber-400" /> Home
              </button>
              {user && (
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="col-span-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 text-left flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400" /> User Dashboard
                </button>
              )}
              {onOpenAndroidModal && (
                <button
                  onClick={() => {
                    onOpenAndroidModal();
                    setMobileMenuOpen(false);
                  }}
                  className="col-span-2 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-500/15 text-emerald-300 text-left flex items-center gap-2 border border-emerald-500/30"
                >
                  <Smartphone className="w-4 h-4" /> GoGlobal Native Android App (APK / AAB)
                </button>
              )}
              <div className="col-span-2 pt-1">
                <PWAInstallButton variant="prominent" className="w-full" onOpenAndroidModal={onOpenAndroidModal} />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
