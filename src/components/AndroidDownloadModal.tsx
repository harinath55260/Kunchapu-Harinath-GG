import React, { useState } from 'react';
import {
  Globe,
  Download,
  CheckCircle,
  X,
  Copy,
  Check,
  Zap,
  HardDrive,
  Maximize2,
  Package,
  Terminal,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidDownloadModalProps {
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const AndroidDownloadModal: React.FC<AndroidDownloadModalProps> = ({
  onClose,
  onShowToast
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://goglobal-culture.web.app';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      if (onShowToast) onShowToast('Link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCmd = (cmd: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cmd);
      setCopiedCmd(label);
      if (onShowToast) onShowToast(`Copied ${label} to clipboard!`);
      setTimeout(() => setCopiedCmd(null), 2500);
    }
  };

  const handleInstallClick = async () => {
    setIsInstalling(true);
    const success = await install();
    setIsInstalling(false);
    if (success) {
      setInstalledSuccess(true);
      if (onShowToast) onShowToast('GoGlobal installed successfully!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-white my-auto max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/30 p-2.5">
            <Globe className="w-full h-full text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Official Android App
              </span>
              <span className="text-xs text-slate-400">
                v2.4 PWA Ready
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              GoGlobal for Android
            </h2>
          </div>
        </div>

        {/* Mode Selector Tabs (ShopVerse Pattern: PWA Quick Install + Native APK & Gradle) */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-5 shrink-0">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Android Install</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Native Kotlin APK / AAB</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto space-y-5 flex-1 pr-1 text-slate-300 text-xs">
          
          {activeTab === 'pwa' ? (
            <>
              {/* App Status / Direct Install Banner */}
              <div className="bg-amber-950/40 border border-amber-500/25 rounded-2xl p-4">
                {isInstalled || installedSuccess ? (
                  <div className="flex items-center gap-3 text-emerald-300">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">App is Installed on this Device!</p>
                      <p className="text-xs text-emerald-400/80">
                        Launch GoGlobal from your home screen or app drawer for the full cultural video exploration experience.
                      </p>
                    </div>
                  </div>
                ) : isInstallable ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">1-Click Quick Android Install</p>
                      <p className="text-xs text-slate-300">
                        Instant setup with offline cultural content, India Dossier & fullscreen video playback.
                      </p>
                    </div>
                    <button
                      onClick={handleInstallClick}
                      disabled={isInstalling}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition transform active:scale-95 shrink-0"
                    >
                      <Download className="w-5 h-5" />
                      <span>{isInstalling ? 'Installing...' : 'Install Android App'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">Install on Android Device</p>
                      <span className="text-xs text-amber-400 font-semibold">Chrome / Edge / Samsung Browser</span>
                    </div>
                    <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <li>
                        Open this link in <strong className="text-white">Google Chrome</strong> on your Android phone.
                      </li>
                      <li>
                        Tap the <strong className="text-white">Three Dots (⋮)</strong> menu in the top right.
                      </li>
                      <li>
                        Tap <strong className="text-amber-400">"Install app"</strong> or <strong className="text-amber-400">"Add to Home Screen"</strong>.
                      </li>
                      <li>
                        GoGlobal will appear as a native Android app with its own icon!
                      </li>
                    </ol>
                  </div>
                )}
              </div>

              {/* 4 Capability Cards (ShopVerse 2x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-amber-400 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-semibold text-white">60 FPS Native Playback</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hardware-accelerated video rendering optimized for Android mobile GPUs.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <HardDrive className="w-4 h-4" />
                    <span className="text-xs font-semibold text-white">Offline Cache</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Browse saved cultural videos, heritage dossiers & articles even without stable internet.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-xs font-semibold text-white">Zero URL Bar</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Immersive edge-to-edge native display without browser navigation clutter.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-rose-400 mb-1">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-semibold text-white">TWA / APK Ready</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    W3C compliant manifest ready for Google Play Store packaging.
                  </p>
                </div>
              </div>

              {/* Open on Your Android Phone Box */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">Open on Your Android Phone:</span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 overflow-x-auto select-all font-mono">
                  <span>{currentUrl}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Package name: <code className="text-amber-400 font-mono">com.goglobal.app</code>
                  </span>
                  <span className="bg-amber-950/60 border border-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-medium">
                    Trusted Web Activity
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Native Android APK Build & Release (Full Stack Android System) */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Terminal className="w-4 h-4" />
                    <span>Native Android Project Ready (/app)</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    The complete Jetpack Compose Android app with Firebase authentication, Firestore sync, and video player is fully configured in the repository.
                  </p>
                </div>

                {/* Gradle Commands */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 font-sans">
                    <span className="font-semibold text-white">Terminal / Gradle Commands</span>
                    <span className="text-[10px] text-slate-500">Android Studio Iguana / Ladybug+</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-emerald-400">./gradlew assembleDebug</span>
                        <button
                          onClick={() => handleCopyCmd('./gradlew assembleDebug', 'Debug APK Command')}
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          {copiedCmd === 'Debug APK Command' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans mt-1">
                        Builds <code className="text-amber-300">app/build/outputs/apk/debug/app-debug.apk</code> for direct side-loading on any Android phone.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-emerald-400">./gradlew bundleRelease</span>
                        <button
                          onClick={() => handleCopyCmd('./gradlew bundleRelease', 'Release AAB Command')}
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          {copiedCmd === 'Release AAB Command' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans mt-1">
                        Builds <code className="text-amber-300">app/build/outputs/bundle/release/app-release.aab</code> for Google Play Console publishing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Source Architecture */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 leading-normal overflow-x-auto">
                  <div className="font-sans font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Android Source Architecture</span>
                  </div>
                  <div>app/src/main/java/com/goglobal/app/</div>
                  <div>├── MainActivity.kt (Compose Navigation, India Dossier & Video Feed)</div>
                  <div>├── GoGlobalApplication.kt (Firebase Auth & Firestore Initialization)</div>
                  <div>├── data/model/CulturalModels.kt (VideoItem, UserProfile, etc.)</div>
                  <div>├── data/repository/CultureRepository.kt (Real-time Firestore StateFlow & Delete)</div>
                  <div>└── ui/navigation/Screen.kt</div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer (ShopVerse Pattern: "Done" button) */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            Package: <strong className="text-amber-400">com.goglobal.app</strong>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
