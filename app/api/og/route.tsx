import { ImageResponse } from 'next/og';
import { DEFAULT_SETTINGS, type Settings } from '@/lib/types';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function ambilSettings(): Promise<Settings> {
  const base = (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '').replace(/\/$/, '');
  if (!base) return DEFAULT_SETTINGS;
  try {
    const r = await fetch(`${base}/settings.json`, { cache: 'no-store' });
    const d = r.ok ? await r.json() : null;
    return { ...DEFAULT_SETTINGS, ...(d || {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function GET() {
  const s = await ambilSettings();
  const situs = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pawon-mbak-ika.vercel.app').replace(/\/$/, '');
  const logo = s.logoUrl?.startsWith('http') ? s.logoUrl : `${situs}/logo.png`;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#2E4630',
          color: '#F3EEE4',
          padding: 64,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt=""
              width={110}
              height={110}
              style={{ borderRadius: 24, objectFit: 'cover', background: '#fff' }}
            />
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 26, letterSpacing: 5, color: '#D9A03C' }}>
              MASAKAN TRADISIONAL NUSANTARA
            </div>
            <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, opacity: 0.6, marginTop: 6 }}>
              SEJAK 2010
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.02 }}>{s.namaUsaha}</div>
          <div style={{ fontSize: 40, marginTop: 14, color: '#D9A03C' }}>{s.tagline}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 30 }}>
          <div
            style={{
              display: 'flex',
              background: '#B4623B',
              color: '#fff',
              padding: '12px 26px',
              borderRadius: 999,
            }}
          >
            Menu ganti tiap hari
          </div>
          <div style={{ display: 'flex', opacity: 0.85 }}>Pesan online · bayar tunai / QRIS</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
