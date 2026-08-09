'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __promptPasang?: any;
  }
}

export default function DaftarSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const tangkap = (e: Event) => {
      e.preventDefault();
      window.__promptPasang = e;
      window.dispatchEvent(new Event('pawon:bisa-dipasang'));
    };
    window.addEventListener('beforeinstallprompt', tangkap);
    return () => window.removeEventListener('beforeinstallprompt', tangkap);
  }, []);
  return null;
}
