'use client';

import { useEffect, useState } from 'react';

export default function Bagikan({ judul }: { judul: string }) {
  const [url, setUrl] = useState('');
  const [disalin, setDisalin] = useState(false);

  useEffect(() => setUrl(window.location.origin), []);

  const teks = `${judul} — menu hari ini & pesan online:`;
  const e = encodeURIComponent;

  const tautan = [
    { nama: 'WhatsApp', href: `https://wa.me/?text=${e(teks + ' ' + url)}` },
    { nama: 'Telegram', href: `https://t.me/share/url?url=${e(url)}&text=${e(teks)}` },
    { nama: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}` },
    { nama: 'X', href: `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(teks)}` },
  ];

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setDisalin(true);
      setTimeout(() => setDisalin(false), 2000);
    } catch {
      setDisalin(false);
    }
  };

  const bagikanNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: judul, text: teks, url });
      } catch {
        /* dibatalkan pengguna */
      }
    } else {
      salin();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tautan.map((t) => (
        <a
          key={t.nama}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-paper/30 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-paper hover:text-daun"
        >
          {t.nama}
        </a>
      ))}
      <button
        onClick={bagikanNative}
        className="rounded-full border border-paper/30 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-paper hover:text-daun"
      >
        Instagram / lainnya
      </button>
      <button
        onClick={salin}
        className="rounded-full bg-kunyit px-4 py-2 text-sm font-bold text-ink transition hover:brightness-105"
      >
        {disalin ? 'Link tersalin' : 'Salin link'}
      </button>
    </div>
  );
}
