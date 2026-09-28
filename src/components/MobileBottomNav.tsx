import React, { useState } from 'react';
import { Globe, Plus, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MobileMoreDrawer } from './MobileMoreDrawer';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenShareModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAndroidModal?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenShareModal,
  onOpenAuthModal,
  onOpenAndroidModal,
  searchQuery,
  onSearchChange
}) => {
  const { user } = useAuth();
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  const handleHomeClick = () => {
    if (currentView !== 'home') {
      onNavigate('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If already on home, smooth scroll down to the video feed or back to top
      const scrollY = window.scrollY;
      if (scrollY < 200) {
        document.getElementById('youtube-cultural-feed')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleShareClick = () => {
    if (!user) {
      onOpenAuthModal();
    } else {
      onOpenShareModal();
    }
  };

  const isHomeActive = currentView === 'home';

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Visible only on mobile / small screens < lg) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.7)] px-6 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          {/* 1. Mobile Home Button */}
          <button
            type="button"
            onClick={handleHomeClick}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 px-4 rounded-xl cursor-pointer active:scale-95 ${
              isHomeActive
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-all ${
              isHomeActive
                ? 'bg-amber-500/15 ring-1 ring-amber-500/30'
                : ''
            }`}>
              <Globe className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110' : ''}`} />
              {isHomeActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
            <span className="text-[11px] font-semibold tracking-wide">Home</span>
          </button>

          {/* 2. Mobile Centerpiece Share Button */}
          <button
            type="button"
            onClick={handleShareClick}
            className="flex flex-col items-center justify-center gap-0.5 -mt-5 transition-all group cursor-pointer active:scale-95"
            aria-label="Share Cultural Video"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-xl shadow-rose-600/30 ring-4 ring-slate-950 group-hover:shadow-rose-600/50 transition-all">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white">
                <Plus className="w-7 h-7 stroke-[2.5] transform group-hover:rotate-90 transition-transform duration-300" />
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-amber-300 tracking-wide mt-0.5">
              Share
            </span>
          </button>

          {/* 3. Mobile More Button */}
          <button
            type="button"
            onClick={() => setIsMoreDrawerOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 px-4 rounded-xl cursor-pointer active:scale-95 ${
              isMoreDrawerOpen
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Open More Options"
          >
            <div className={`p-1 rounded-xl transition-all ${
              isMoreDrawerOpen
                ? 'bg-amber-500/15 ring-1 ring-amber-500/30'
                : ''
            }`}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold tracking-wide">More</span>
          </button>

        </div>
      </nav>

      {/* Slide-Up Mobile More Drawer */}
      <MobileMoreDrawer
        isOpen={isMoreDrawerOpen}
        onClose={() => setIsMoreDrawerOpen(false)}
        onNavigate={onNavigate}
        onOpenShareModal={onOpenShareModal}
        onOpenAuthModal={onOpenAuthModal}
        onOpenAndroidModal={onOpenAndroidModal}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
    </>
  );
};
