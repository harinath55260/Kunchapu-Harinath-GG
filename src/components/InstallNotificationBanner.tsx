import React, { useState, useEffect } from 'react';
import { Globe, Download, Smartphone, X, Sparkles, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallNotificationBannerProps {
  onOpenAndroidModal: () => void;
}

export const InstallNotificationBanner: React.FC<InstallNotificationBannerProps> = ({
  onOpenAndroidModal
}) => {
  const { isInstallable, isInstalled, isOnline, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (isInstalled) {
      setIsVisible(false);
      return;
    }

    if (!sessionStorage.getItem('goglobal_pwa_dismissed')) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('goglobal_pwa_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
      setIsVisible(false);
    } else {
      onOpenAndroidModal();
    }
  };

  // If offline, display the top offline banner matching ShopVerse pattern
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-slate-950 font-bold text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-lg">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Offline Mode • Browsing cached cultural heritage & videos</span>
      </div>
    );
  }

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <aside
      aria-label="Install App Notification"
      className="fixed bottom-24 sm:bottom-6 left-3 sm:left-5 z-30 max-w-sm w-[calc(100%-24px)] sm:w-full bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 font-black">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                Android & Mobile
              </span>
            </div>
            <h4 className="text-xs font-bold text-white mt-0.5">
              Install GoGlobal App
            </h4>
            <p className="text-[11px] text-slate-300">
              Instant load, cultural video feed, India Dossier & offline cultural heritage.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 transition"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>
            {isInstalling ? 'Installing...' : isInstallable ? 'Install Now' : 'Install Android App'}
          </span>
        </button>

        <button
          onClick={onOpenAndroidModal}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
        >
          Details
        </button>
      </div>
    </aside>
  );
};
