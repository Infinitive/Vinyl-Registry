import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

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

  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D2D2A] text-[#FAF8F5] border border-[#5D614E] text-xs font-medium shadow-lg backdrop-blur-md animate-fade-in"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#D8DCCB] animate-pulse" />
      <span>Offline Mode • Local Library Active</span>
    </div>
  );
};
