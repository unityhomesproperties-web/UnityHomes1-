import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, RefreshCw, AlertTriangle, CloudLightning 
} from 'lucide-react';

interface ConnectivityIndicatorProps {
  onSyncComplete?: (logs: any[]) => void;
  triggerSuccess: (msg: string) => void;
}

export default function ConnectivityIndicator({ 
  onSyncComplete, 
  triggerSuccess 
}: ConnectivityIndicatorProps) {
  const [status, setStatus] = useState<'Online' | 'Offline' | 'Reconnecting'>('Online');
  const [lastHeartbeat, setLastHeartbeat] = useState<string>('');
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // Initialize heartbeat timestamp
  useEffect(() => {
    const updateHeartbeat = () => {
      const now = new Date();
      setLastHeartbeat(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    
    updateHeartbeat();
    const interval = setInterval(() => {
      if (status === 'Online') {
        updateHeartbeat();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [status]);

  // Read offline queue from localStorage on mount
  useEffect(() => {
    try {
      const savedQueue = localStorage.getItem('uh_offline_queue_v1');
      if (savedQueue) {
        setOfflineQueue(JSON.parse(savedQueue));
      }
    } catch (e) {
      console.error('Error loading offline queue:', e);
    }
  }, []);

  // Sync queued items back to the system when going online
  const triggerSync = (currentQueue: any[]) => {
    if (currentQueue.length === 0) return;
    
    setStatus('Reconnecting');
    
    setTimeout(() => {
      setStatus('Online');
      triggerSuccess(`Re-established server link! Synced ${currentQueue.length} queued action(s) to core database ledger.`);
      
      // Clear queue
      localStorage.setItem('uh_offline_queue_v1', JSON.stringify([]));
      setOfflineQueue([]);
      
      if (onSyncComplete) {
        onSyncComplete(currentQueue);
      }
    }, 15000); // 1.5 seconds reconnection delay for feedback
  };

  const toggleConnection = () => {
    if (status === 'Online') {
      setStatus('Offline');
      triggerSuccess('Manual offline mode active. Local-first ledger is operational. Changes will be queued.');
    } else if (status === 'Offline') {
      triggerSync(offlineQueue);
    }
  };

  // Helper to add action to offline queue from external sources
  useEffect(() => {
    const handleOfflineMutation = (e: any) => {
      const mutation = e.detail;
      if (status === 'Offline') {
        const updated = [...offlineQueue, { ...mutation, timestamp: Date.now() }];
        setOfflineQueue(updated);
        localStorage.setItem('uh_offline_queue_v1', JSON.stringify(updated));
        triggerSuccess(`Offline local-first mode: queued action "${mutation.type || 'database change'}" to local storage.`);
      }
    };

    window.addEventListener('uh_offline_mutation', handleOfflineMutation);
    return () => {
      window.removeEventListener('uh_offline_mutation', handleOfflineMutation);
    };
  }, [status, offlineQueue]);

  return (
    <div className="space-y-4">
      {/* Indicator Widget */}
      <div className="bg-white border border-teal-50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className={`flex h-3 w-3 relative`}>
              {status === 'Online' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              {status === 'Reconnecting' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                status === 'Online' ? 'bg-emerald-500' : status === 'Offline' ? 'bg-rose-500' : 'bg-amber-500'
              }`}></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-teal-950 uppercase">PMC NETWORK FEED</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                status === 'Online' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                status === 'Offline' ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                'bg-amber-50 text-amber-800 border border-amber-100 animate-pulse'
              }`}>
                {status}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              {status === 'Online' ? `Connected • Heartbeat sync at ${lastHeartbeat}` :
               status === 'Offline' ? 'Local Storage Local-First Mode Active' : 'Restoring secure socket stream...'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {offlineQueue.length > 0 && (
            <span className="text-[10px] font-mono font-bold bg-amber-100 border border-amber-200 text-amber-800 px-2 py-1 rounded-lg">
              {offlineQueue.length} Queue Pending
            </span>
          )}
          
          <span className="text-[10px] font-mono font-bold text-#6B7280 uppercase px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${status === 'Online' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span>{status === 'Online' ? 'System Live' : status}</span>
          </span>
        </div>
      </div>

      {/* Connection Mode Banner Warnings */}
      {status === 'Offline' && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-2xl flex items-start space-x-2.5 animate-pulse text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Offline Local-First Operations Enabled</strong>
            <span className="text-[11px] block mt-0.5 text-amber-800">
              Your modifications are queued locally in your browser sandbox. When the connection toggle is switched back, your mutations will automatically resolve.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Global utility helper to dispatch a mutation event when offline
export function queueOfflineMutation(type: string, payload: any) {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent('uh_offline_mutation', {
    detail: { type, payload }
  });
  window.dispatchEvent(event);
}
