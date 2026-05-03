'use client';

import { useEffect, useState } from 'react';
import { FaWifi } from 'react-icons/fa';

export default function NetworkIndicator() {
  const [ping, setPing] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if online
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Measure ping by making a request to the server
    const measurePing = async () => {
      if (!navigator.onLine) {
        setPing(null);
        return;
      }

      const start = Date.now();
      try {
        // Ping the server with a lightweight request
        await fetch('/api/ping', {
          method: 'HEAD',
          cache: 'no-cache',
        });
        const end = Date.now();
        setPing(end - start);
      } catch (error) {
        setPing(999);
      }
    };

    // Measure ping immediately
    measurePing();

    // Measure ping every 5 seconds
    const interval = setInterval(measurePing, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getPingColor = () => {
    if (!isOnline || ping === null) return 'text-gray-400';
    if (ping >= 999) return 'text-red-500';
    if (ping >= 500) return 'text-orange-500';
    if (ping >= 200) return 'text-yellow-500';
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
    if (ping >= 999) return 0;
    if (ping >= 500) return 1;
    if (ping >= 200) return 2;
    if (ping >= 100) return 3;
    return 4;
  };

  const signalBars = getSignalBars();

  return (
    <div className="flex items-center gap-2">
      {/* Signal bars */}
      <div className="flex items-end gap-0.5 h-4">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded-sm transition-all ${
              bar <= signalBars ? getPingColor() : 'bg-gray-300'
            }`}
            style={{
              height: `${bar * 25}%`,
              backgroundColor: bar <= signalBars ? undefined : undefined,
            }}
          />
        ))}
      </div>

      {/* Ping text */}
      <span className={`text-xs font-medium ${getPingColor()}`}>
        {getPingText()}
      </span>
    </div>
  );
}
