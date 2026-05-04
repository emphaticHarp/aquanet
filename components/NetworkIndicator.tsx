'use client';

import { useEffect, useState } from 'react';
import { FaDatabase } from 'react-icons/fa';

export default function NetworkIndicator() {
  const [ping, setPing] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'error' | 'checking'>('checking');
  const [dbPing, setDbPing] = useState<number | null>(null);

  // ── Network ping ────────────────────────────────────────────
  const measurePing = async () => {
    if (!navigator.onLine) { setPing(null); return; }
    const start = Date.now();
    try {
      await fetch('/api/ping', { method: 'HEAD', cache: 'no-cache' });
      setPing(Date.now() - start);
    } catch {
      setPing(999);
    }
  };

  // ── DB status ───────────────────────────────────────────────
  const checkDB = async () => {
    try {
      const res = await fetch('/api/db-status', { cache: 'no-cache' });
      const data = await res.json();
      setDbStatus(data.status === 'connected' ? 'connected' : 'error');
      setDbPing(data.ping ?? null);
    } catch {
      setDbStatus('error');
      setDbPing(null);
    }
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);
    window.addEventListener('online',  () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    measurePing();
    checkDB();

    const pingInterval = setInterval(measurePing, 5000);
    const dbInterval   = setInterval(checkDB,     8000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(dbInterval);
    };
  }, []);

  // ── Helpers ─────────────────────────────────────────────────
  const getPingColor = () => {
    if (!isOnline || ping === null) return 'text-gray-400';
    if (ping >= 500) return 'text-red-500';
    if (ping >= 200) return 'text-orange-500';
    if (ping >= 100) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPingText = () => {
    if (!isOnline) return 'Offline';
    if (ping === null) return '...';
    if (ping >= 999) return '+999ms';
    return `${ping}ms`;
  };

  const getSignalBars = () => {
    if (!isOnline || ping === null) return 0;
    if (ping >= 500) return 1;
    if (ping >= 200) return 2;
    if (ping >= 100) return 3;
    return 4;
  };

  const dbColor = {
    connected:    'text-green-500',
    disconnected: 'text-red-500',
    error:        'text-red-500',
    checking:     'text-yellow-500',
  }[dbStatus];

  const dbDotColor = {
    connected:    'bg-green-500',
    disconnected: 'bg-red-500',
    error:        'bg-red-500',
    checking:     'bg-yellow-400',
  }[dbStatus];

  const dbLabel = {
    connected:    'DB Connected',
    disconnected: 'DB Offline',
    error:        'DB Error',
    checking:     'DB Checking...',
  }[dbStatus];

  const signalBars = getSignalBars();

  return (
    <div className="flex flex-col gap-1.5">
      {/* ── Network row ── */}
      <div className="flex items-center gap-2">
        {/* Signal bars */}
        <div className="flex items-end gap-0.5 h-4">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-1 rounded-sm transition-all duration-300 ${
                bar <= signalBars
                  ? getPingColor().replace('text-', 'bg-')
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={{ height: `${bar * 25}%` }}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold ${getPingColor()}`}>
          {getPingText()}
        </span>
      </div>

      {/* ── DB status row ── */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-shrink-0">
          <FaDatabase className={`text-xs ${dbColor}`} />
          {/* Pulse animation when connected */}
          {dbStatus === 'connected' && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full">
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
            </span>
          )}
        </div>
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dbDotColor} ${dbStatus === 'checking' ? 'animate-pulse' : ''}`} />
        <span className={`text-[10px] font-semibold ${dbColor}`}>
          {dbLabel}
          {dbStatus === 'connected' && dbPing !== null && (
            <span className="text-gray-400 font-normal ml-1">({dbPing}ms)</span>
          )}
        </span>
      </div>
    </div>
  );
}
