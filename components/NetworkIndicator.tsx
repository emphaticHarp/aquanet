'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

type NetworkStatus = 'online' | 'offline' | 'slow';
type SignalStrength = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

interface SpeedMetrics {
  latency: number;
  bandwidth: string;
  signalStrength: SignalStrength;
}

export function NetworkIndicator() {
  const [status, setStatus] = useState<NetworkStatus>('online');
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [speedMetrics, setSpeedMetrics] = useState<SpeedMetrics>({
    latency: 0,
    bandwidth: '0 Mbps',
    signalStrength: 'excellent',
  });
  const [showDetails, setShowDetails] = useState(false);

  // Determine signal strength based on latency
  const getSignalStrength = (latency: number): SignalStrength => {
    if (latency < 50) return 'excellent';
    if (latency < 100) return 'good';
    if (latency < 200) return 'fair';
    if (latency < 500) return 'poor';
    return 'offline';
  };

  // Calculate bandwidth from latency (simulated)
  const calculateBandwidth = (latency: number): string => {
    if (latency < 50) return '50+ Mbps';
    if (latency < 100) return '25-50 Mbps';
    if (latency < 200) return '10-25 Mbps';
    if (latency < 500) return '1-10 Mbps';
    return '< 1 Mbps';
  };

  useEffect(() => {
    // Check initial status
    setStatus(navigator.onLine ? 'online' : 'offline');
    setIsVisible(true);

    // Listen for online/offline events
    const handleOnline = () => setStatus('online');
    const handleOffline = () => setStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection speed
    const checkConnection = async () => {
      setIsChecking(true);
      try {
        const start = performance.now();
        const response = await fetch('/api/health', { method: 'HEAD' });
        const end = performance.now();
        const latency = Math.round(end - start);

        if (!response.ok) {
          setStatus('offline');
          setSpeedMetrics({
            latency: 0,
            bandwidth: '0 Mbps',
            signalStrength: 'offline',
          });
          setIsChecking(false);
          return;
        }

        const signalStrength = getSignalStrength(latency);
        const bandwidth = calculateBandwidth(latency);

        setSpeedMetrics({
          latency,
          bandwidth,
          signalStrength,
        });

        // If response takes more than 2 seconds, mark as slow
        if (latency > 2000) {
          setStatus('slow');
        } else {
          setStatus('online');
        }
      } catch {
        setStatus('offline');
        setSpeedMetrics({
          latency: 0,
          bandwidth: '0 Mbps',
          signalStrength: 'offline',
        });
      } finally {
        setIsChecking(false);
      }
    };

    // Check connection immediately and then every 3 seconds for live updates
    checkConnection();
    const interval = setInterval(checkConnection, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  const statusConfig = {
    online: {
      icon: Wifi,
      color: 'text-green-600',
      bg: 'bg-green-50',
      label: 'Connected',
      border: 'border-green-200',
    },
    slow: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      label: 'Slow Connection',
      border: 'border-yellow-200',
    },
    offline: {
      icon: WifiOff,
      color: 'text-red-600',
      bg: 'bg-red-50',
      label: 'No Connection',
      border: 'border-red-200',
    },
  };

  const signalConfig = {
    excellent: { bars: 5, color: 'bg-green-600', label: 'Excellent' },
    good: { bars: 4, color: 'bg-emerald-500', label: 'Good' },
    fair: { bars: 3, color: 'bg-yellow-500', label: 'Fair' },
    poor: { bars: 2, color: 'bg-orange-500', label: 'Poor' },
    offline: { bars: 0, color: 'bg-red-600', label: 'Offline' },
  };

  const config = statusConfig[status];
  const signalConfig_ = signalConfig[speedMetrics.signalStrength];
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Main indicator button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bg} ${config.border} transition-all duration-300 hover:shadow-md active:scale-95`}
        role="status"
        aria-live="polite"
        aria-label={`Network status: ${config.label}. Signal strength: ${speedMetrics.signalStrength}. Latency: ${speedMetrics.latency}ms`}
        title="Click to see network details"
      >
        <Icon className={`w-4 h-4 ${config.color} ${isChecking ? 'animate-pulse' : ''}`} />
        <span className={`text-xs font-medium ${config.color} font-nunito`}>
          {config.label}
        </span>
      </button>

      {/* Detailed network info panel */}
      {showDetails && (
        <div className={`absolute top-12 right-0 mt-2 w-64 rounded-lg border shadow-lg p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${config.bg} ${config.border}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 font-nunito">Network Status</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close network details"
            >
              ✕
            </button>
          </div>

          {/* Signal Strength Bars */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700 font-nunito">Signal Strength</span>
              <span className={`text-xs font-semibold ${signalConfig_.color.replace('bg-', 'text-')}`}>
                {signalConfig_.label}
              </span>
            </div>
            <div className="flex items-end gap-1 h-8">
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  className={`flex-1 rounded-sm transition-all ${
                    bar <= signalConfig_.bars
                      ? `${signalConfig_.color}`
                      : 'bg-gray-200'
                  }`}
                  style={{ height: `${bar * 20}%` }}
                  role="progressbar"
                  aria-valuenow={signalConfig_.bars}
                  aria-valuemin={0}
                  aria-valuemax={5}
                />
              ))}
            </div>
          </div>

          {/* Latency */}
          <div className="mb-3 p-2 bg-white/50 rounded border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-nunito">Latency</span>
              <span className="text-sm font-semibold text-gray-900 font-nunito">
                {speedMetrics.latency}ms
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  speedMetrics.latency < 50
                    ? 'bg-green-600'
                    : speedMetrics.latency < 100
                    ? 'bg-emerald-500'
                    : speedMetrics.latency < 200
                    ? 'bg-yellow-500'
                    : speedMetrics.latency < 500
                    ? 'bg-orange-500'
                    : 'bg-red-600'
                }`}
                style={{ width: `${Math.min((speedMetrics.latency / 500) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Bandwidth */}
          <div className="p-2 bg-white/50 rounded border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-nunito">Bandwidth</span>
              <span className="text-sm font-semibold text-gray-900 font-nunito">
                {speedMetrics.bandwidth}
              </span>
            </div>
          </div>

          {/* Status indicator */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-600' : status === 'slow' ? 'bg-yellow-600' : 'bg-red-600'} animate-pulse`} />
              <span className="text-xs text-gray-600 font-nunito">
                {status === 'online' ? 'Connection stable' : status === 'slow' ? 'Connection slow' : 'Connection lost'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
