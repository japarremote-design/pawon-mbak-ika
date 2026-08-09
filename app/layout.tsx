import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getMenu, getSettings } from '@/lib/server-data';
import { tanggalLayan } from '@/lib/utils';
import DaftarSW from '@/components/DaftarSW';

export const dynamic = 'force-dynamic';

function siteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return raw.replace(/\/$/, '');
}

/** Sidik jari menu aktif — dipakai supaya WhatsApp/Facebook memuat ulang pratinjau tiap menu berganti. */
function sidikMenu(daftar: { id: string; nama: string; harga: number; gambarUrl?: string }[]) {
  const teks = daftar.map((m) => `${m.id}${m.harga}${m.gambarUrl || ''}`).join('|');
  let h = 0;
  for (let i = 0; i < teks.length; i++) h = (Math.imul(31, h) + teks.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export async function generateMetadata(): Promise<Metadata> {
  const [s, menu] = await Promise.all([getSettings(), getMenu()]);
  const url = siteUrl();

  const aktif = menu.filter((m) => m.aktif && (m.stok == null || m.stok > 0));
  const layan = tanggalLayan(s.jamGantiMenu);
  const kapan = layan.untukBesok ? 'besok' : 'hari ini';
  const judul = aktif.length
    ? `${s.namaUsaha} — ${aktif.length} menu ready ${kapan}`
    : `${s.namaUsaha} — Menu Hari Ini & Pesan Online`;

  // isi teks pratinjau ikut menyebut menu yang sedang dibuka
  const daftarMenu = aktif
    .slice(0, 6)
    .map((m) => `${m.nama} ${m.harga >= 1000 ? Math.round(m.harga / 1000) + 'k' : m.harga}`)
    .join(' · ');
  const deskripsi = aktif.length
    ? `Menu ${kapan}: ${daftarMenu}${aktif.length > 6 ? ' · dan lainnya' : ''}. Pesan online, bayar tunai atau QRIS.`
    : s.deskripsi;

  const gambar = s.ogImage || `${url}/api/og?v=${sidikMenu(aktif)}${layan.untukBesok ? 'b' : ''}`;
  return {
    metadataBase: new URL(url),
    title: { default: judul, template: `%s · ${s.namaUsaha}` },
    description: deskripsi,
    applicationName: s.namaUsaha,
    manifest: '/manifest.webmanifest',
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url,
      siteName: s.namaUsaha,
      title: judul,
      description: deskripsi,
      images: [{ url: gambar, width: 1200, height: 630, alt: s.namaUsaha }],
    },
    twitter: {
      card: 'summary_large_image',
      title: judul,
      description: deskripsi,
      images: [gambar],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: '#2E4630',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Pawon Mbak Ika" />
      </head>
      <body className="min-h-dvh antialiased">
        {children}
        <DaftarSW />
      </body>
    </html>
  );
}
