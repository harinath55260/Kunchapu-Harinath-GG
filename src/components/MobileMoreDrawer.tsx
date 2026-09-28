import React, { useState } from 'react';
import {
  X,
  Globe,
  PlusCircle,
  LayoutDashboard,
  Bookmark,
  Smartphone,
  Download,
  Search,
  LogOut,
  User,
  Shield,
  Sparkles,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { CULTURAL_COUNTRIES } from '../data/seedData';

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, param?: string) => void;
  onOpenShareModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAndroidModal?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenShareModal,
  onOpenAuthModal,
  onOpenAndroidModal,
  searchQuery,
  onSearchChange
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [internalSearch, setInternalSearch] = useState(searchQuery);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(internalSearch);
    onNavigate('home');
    onClose();
    setTimeout(() => {
      document.getElementById('youtube-cultural-feed')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleCountrySelect = (countryId: string) => {
    onNavigate('country-detail', countryId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Slide-up Bottom Sheet Drawer */}
      <div
        className="absolute inset-x-0 bottom-0 max-h-[88vh] bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 pb-[max(1rem,env(safe-area-inset-bottom))]"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Pull Handle */}
        <div className="pt-3 pb-2 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-slate-700/80 rounded-full" />
        </div>

        {/* Drawer Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white font-serif">
                Go<span className="text-amber-400">Global</span>
              </h3>
              <p className="text-[11px] text-slate-400">Mobile Navigation & Cultural Hub</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 overscroll-contain">
          
          {/* User Account / Profile Card */}
          {user ? (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3 min-w-0">
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.displayName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-amber-500/50 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-sm border border-slate-700 shrink-0">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">{user.displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    Contributor Active
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigate('profile');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs border border-amber-500/30 shrink-0 transition"
              >
                Dashboard
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white">Join Cultural Community</h4>
                <p className="text-xs text-slate-300 mt-0.5">Share YouTube videos & save heritage</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-extrabold text-xs shadow-md transition shrink-0"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Quick In-Drawer Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search traditions, countries, cuisine..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-20 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition"
            >
              Search
            </button>
          </form>

          {/* Core Mobile Actions Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Quick Navigation
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onNavigate('home');
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left flex items-center gap-2.5 text-slate-200 hover:text-white transition"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Home Feed</p>
                  <p className="text-[10px] text-slate-400">All Cultural Videos</p>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenShareModal();
                }}
                className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 hover:from-amber-500/25 hover:to-rose-500/25 border border-amber-500/30 text-left flex items-center gap-2.5 text-amber-200 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Share Culture</p>
                  <p className="text-[10px] text-amber-300">Add YouTube Video</p>
                </div>
              </button>

              {user && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left flex items-center gap-2.5 text-slate-200 hover:text-white transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">My Dashboard</p>
                      <p className="text-[10px] text-slate-400">Your Uploads</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('saved');
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left flex items-center gap-2.5 text-slate-200 hover:text-white transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Saved Videos</p>
                      <p className="text-[10px] text-slate-400">Cultural Library</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Android & PWA Mobile App Downloads */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Mobile App & Offline Access
            </span>

            {onOpenAndroidModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAndroidModal();
                }}
                className="w-full p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-left flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white">GoGlobal Native Android App</p>
                      <span className="text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded">
                        APK / AAB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">TWA, offline cache & native performance</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition" />
              </button>
            )}

            <div className="pt-1">
              <PWAInstallButton
                variant="prominent"
                className="w-full"
                onOpenAndroidModal={onOpenAndroidModal}
              />
            </div>
          </div>

          {/* Sovereign Country Profiles Carousel */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Explore Sovereign Country Profiles
            </span>

            <div className="grid grid-cols-3 gap-2">
              {CULTURAL_COUNTRIES.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCountrySelect(c.id)}
                  className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-center flex flex-col items-center gap-1 transition"
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-xs font-bold text-slate-200 truncate w-full">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Sign Out */}
          {user && (
            <div className="pt-2">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/20 flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of GoGlobal</span>
              </button>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-2 text-center text-[10px] text-slate-500">
            GoGlobal Platform • Explore the World. Share Your Culture.
          </div>

        </div>
      </div>
    </div>
  );
};
