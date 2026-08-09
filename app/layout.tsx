import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getSettings } from '@/lib/server-data';
import DaftarSW from '@/components/DaftarSW';

export const dynamic = 'force-dynamic';

function siteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return raw.replace(/\/$/, '');
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const url = siteUrl();
  const judul = `${s.namaUsaha} — Menu Hari Ini & Pesan Online`;
  const gambar = s.ogImage || `${url}/api/og`;
  return {
    metadataBase: new URL(url),
    title: { default: judul, template: `%s · ${s.namaUsaha}` },
    description: s.deskripsi,
    applicationName: s.namaUsaha,
    manifest: '/manifest.webmanifest',
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url,
      siteName: s.namaUsaha,
      title: judul,
      description: s.deskripsi,
      images: [{ url: gambar, width: 1200, height: 630, alt: s.namaUsaha }],
    },
    twitter: {
      card: 'summary_large_image',
      title: judul,
      description: s.deskripsi,
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
