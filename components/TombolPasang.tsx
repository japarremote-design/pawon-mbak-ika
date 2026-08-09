'use client';

import { useEffect, useState } from 'react';

export default function TombolPasang({ kelas = '' }: { kelas?: string }) {
  const [bisa, setBisa] = useState(false);
  const [ios, setIos] = useState(false);
  const [petunjuk, setPetunjuk] = useState(false);

  useEffect(() => {
    const cek = () => setBisa(Boolean(window.__promptPasang));
    cek();
    window.addEventListener('pawon:bisa-dipasang', cek);
    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua);
    const terpasang =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIos(isIos && !terpasang);
    return () => window.removeEventListener('pawon:bisa-dipasang', cek);
  }, []);

  if (!bisa && !ios) return null;

  const pasang = async () => {
    if (ios && !bisa) {
      setPetunjuk(true);
      return;
    }
    const p = window.__promptPasang;
    if (!p) return;
    p.prompt();
    await p.userChoice;
    window.__promptPasang = undefined;
    setBisa(false);
  };

  return (
    <>
      <button onClick={pasang} className={kelas || 'btn-garis text-sm'}>
        <span aria-hidden>⤓</span> Pasang di HP
      </button>
      {petunjuk && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4"
          onClick={() => setPetunjuk(false)}
        >
          <div className="kartu w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">Pasang di iPhone</h3>
            <p className="mt-2 text-sm">
              Buka menu <b>Bagikan</b> di Safari, lalu pilih <b>Tambahkan ke Layar Utama</b>. Setelah itu
              Pawon Mbak Ika muncul seperti aplikasi biasa.
            </p>
            <button className="btn-utama mt-4 w-full" onClick={() => setPetunjuk(false)}>
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
