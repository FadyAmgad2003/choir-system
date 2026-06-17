import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { realtimeSyncService } from '../services/realtimeSync';

interface RealtimeSyncStatusProps {
  language: 'en' | 'ar';
}

export const RealtimeSyncStatus: React.FC<RealtimeSyncStatusProps> = ({ language }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check connection status periodically
    const checkConnection = setInterval(() => {
      const connected = realtimeSyncService.getConnectionStatus();
      setIsConnected(connected);
    }, 1000);

    return () => clearInterval(checkConnection);
  }, []);

  useEffect(() => {
    // Update sync indicator
    if (isConnected) {
      setLastSync(new Date());
      setIsSyncing(false);
    }
  }, [isConnected]);

  const statusText = {
    en: {
      realtime: 'REAL-TIME SYNC',
      connected: 'Connected',
      disconnected: 'Disconnected',
      syncing: 'Syncing...',
      lastSync: 'Last sync'
    },
    ar: {
      realtime: 'المزامنة الفورية',
      connected: 'متصل',
      disconnected: 'غير متصل',
      syncing: 'جاري المزامنة...',
      lastSync: 'آخر مزامنة'
    }
  }[language];

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return language === 'ar' ? 'الآن' : 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return language === 'ar' ? `${minutes}د` : `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return language === 'ar' ? `${hours}س` : `${hours}h`;
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
      isConnected 
        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-600 dark:text-emerald-400'
        : 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400'
    }`}>
      {isSyncing ? (
        <>
          <Activity className="h-3.5 w-3.5 animate-pulse" />
          <span>{statusText.syncing}</span>
        </>
      ) : isConnected ? (
        <>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{statusText.connected}</span>
          {lastSync && <span className="opacity-70">({statusText.lastSync}: {getTimeAgo(lastSync)})</span>}
        </>
      ) : (
        <>
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{statusText.disconnected}</span>
        </>
      )}
    </div>
  );
};
