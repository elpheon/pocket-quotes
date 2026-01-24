import { Capacitor } from '@capacitor/core';

/**
 * Check if the device has network connectivity
 * Works on both web and native platforms
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Subscribe to network status changes
 * Returns a cleanup function
 */
export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
