import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-18 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 border border-amber-400/50 px-3.5 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
      <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
      <span>Offline Mode — Cached cultural content is being displayed.</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-auto p-1 rounded hover:bg-amber-700 transition"
        title="Retry connection"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
