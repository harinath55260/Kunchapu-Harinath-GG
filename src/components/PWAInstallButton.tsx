import React, { useState } from 'react';
import { Download, Smartphone, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'prominent' | 'compact' | 'footer';
  onOpenAndroidModal?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'navbar',
  onOpenAndroidModal
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone PWA mode, don't show the install button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else if (onOpenAndroidModal) {
      onOpenAndroidModal();
    } else {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'navbar' && (
        <button
          onClick={handleInstallClick}
          title="Install GoGlobal App on this device"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border border-amber-500/40 shadow-sm transition-all transform active:scale-95 cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'prominent' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-rose-600/20 transition-all transform active:scale-95 cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 text-slate-950" />
          <span>Install GoGlobal App</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Install</span>
        </button>
      )}

      {variant === 'footer' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App (PWA & Android)</span>
        </button>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
                <p className="text-xs text-slate-400">Add to Home Screen in 2 steps</p>
              </div>
            </div>

            <div className="space-y-3 py-2 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-slate-800 text-amber-400 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">Step 1: Tap Share Button</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Tap the <strong>Share</strong> icon in the Safari bottom toolbar (or top bar on iPad).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">Step 2: Add to Home Screen</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Scroll down in the action sheet and tap <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
