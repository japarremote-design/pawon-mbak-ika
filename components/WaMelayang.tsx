'use client';

import { useEffect, useState } from 'react';
import { waLink } from '@/lib/utils';

export default function WaMelayang({ nomor, nama }: { nomor: string; nama: string }) {
  const [tampil, setTampil] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTampil(true), 900);
    return () => clearTimeout(t);
  }, []);

  const pesan = `Assalamualaikum wr. wb. Halo ${nama}, saya mau tanya menu hari ini.`;

  return (
    <a
      href={waLink(nomor, pesan)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp Pawon Mbak Ika"
      className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-4 font-semibold text-white shadow-lg animate-kedip transition-all ${
        tampil ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 animate-goyang" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.26-4.35c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.2-8.24 8.2Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.19 3.7.59.26 1.04.41 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
      <span className="text-sm">Chat WA</span>
    </a>
  );
}
