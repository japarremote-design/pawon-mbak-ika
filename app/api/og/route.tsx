import { ImageResponse } from 'next/og';
import { DEFAULT_SETTINGS, type MenuItem, type Settings } from '@/lib/types';
import { tanggalLayan } from '@/lib/utils';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const BASE = (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '').replace(/\/$/, '');

async function baca<T>(simpul: string): Promise<T | null> {
  if (!BASE) return null;
  try {
    const r = await fetch(`${BASE}/${simpul}.json`, { cache: 'no-store' });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

/** 30000 -> "30k", 7500 -> "7.5k", 900 -> "Rp900" */
function hargaPendek(n: number) {
  if (!n) return '';
  if (n < 1000) return `Rp${n}`;
  const ribu = n / 1000;
  return `${Number.isInteger(ribu) ? ribu : ribu.toFixed(1)}k`;
}

function fotoKecil(url: string, w: number) {
  return url.includes('/upload/')
    ? url.replace('/upload/', `/upload/f_jpg,q_auto:good,w_${w},h_${w},c_fill,g_auto/`)
    : url;
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export async function GET() {
  const [settingsMentah, menuMentah] = await Promise.all([
    baca<Partial<Settings>>('settings'),
    baca<Record<string, Omit<MenuItem, 'id'>>>('menu'),
  ]);

  const s: Settings = { ...DEFAULT_SETTINGS, ...(settingsMentah || {}) };
  const situs = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pawon-mbak-ika.vercel.app').replace(/\/$/, '');
  const logo = s.logoUrl?.startsWith('http') ? s.logoUrl : `${situs}/logo.png`;

  const aktif = Object.entries(menuMentah || {})
    .map(([id, m]) => ({ id, ...m }))
    .filter((m) => m.aktif && (m.stok == null || m.stok > 0))
    .sort((a, b) => (a.urutan ?? 999) - (b.urutan ?? 999))
    .slice(0, 8);

  // papan menu bisa sedang melayani hari ini atau besok
  const layan = tanggalLayan(s.jamGantiMenu);
  const d = new Date(layan.tanggal + 'T00:00:00Z');
  const tanggal = `${HARI[d.getUTCDay()]}, ${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const labelHari = layan.untukBesok ? 'MENU BESOK' : 'MENU HARI INI';

  const kolom = aktif.length <= 4 ? 2 : aktif.length <= 6 ? 3 : 4;
  const baris: (typeof aktif)[] = [];
  for (let i = 0; i < aktif.length; i += kolom) baris.push(aktif.slice(i, i + kolom));

  const KREM = '#F3EEE4';
  const HIJAU = '#2E4630';
  const COKLAT = '#2A1D16';

  // Tidak ada menu aktif -> kartu bermerek biasa
  if (!aktif.length) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: HIJAU,
            color: KREM,
            padding: 64,
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" width={110} height={110} style={{ borderRadius: 999 }} />
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
            <div style={{ display: 'flex', fontSize: 88, fontWeight: 800, lineHeight: 1.02 }}>{s.namaUsaha}</div>
            <div style={{ display: 'flex', fontSize: 38, marginTop: 12, color: '#D9A03C' }}>{s.tagline}</div>
          </div>
          <div style={{ display: 'flex', fontSize: 30, opacity: 0.85 }}>
            Menu {layan.untukBesok ? 'besok' : 'hari ini'} belum dibuka · pesan online · tunai /
            QRIS
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  const tinggiBaris = baris.length === 1 ? 430 : Math.floor(430 / baris.length) - 8;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: KREM,
          fontFamily: 'sans-serif',
        }}
      >
        {/* kepala */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            background: HIJAU,
            color: KREM,
            padding: '18px 32px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" width={74} height={74} style={{ borderRadius: 999 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 38, fontWeight: 800, lineHeight: 1.1 }}>{s.namaUsaha}</div>
            <div style={{ display: 'flex', fontSize: 22, color: '#D9A03C', marginTop: 2 }}>
              {labelHari} · {tanggal}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              marginLeft: 'auto',
              background: '#B4623B',
              color: '#fff',
              fontSize: 24,
              fontWeight: 700,
              padding: '10px 22px',
              borderRadius: 999,
            }}
          >
            {aktif.length} menu ready
          </div>
        </div>

        {/* kisi foto menu */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 10, gap: 8 }}>
          {baris.map((r, ri) => (
            <div key={ri} style={{ display: 'flex', flex: 1, gap: 8 }}>
              {r.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flex: 1,
                    height: tinggiBaris,
                    position: 'relative',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#DED6C6',
                    alignItems: 'flex-end',
                  }}
                >
                  {m.gambarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fotoKecil(m.gambarUrl, 420)}
                      alt=""
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      margin: 10,
                      background: '#FFFFFF',
                      color: COKLAT,
                      borderRadius: 12,
                      padding: '8px 14px',
                      fontSize: kolom >= 4 ? 22 : 26,
                      fontWeight: 700,
                      maxWidth: '92%',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.nama}
                    </div>
                    <div style={{ display: 'flex', color: '#B4623B' }}>{hargaPendek(m.harga)}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* kaki */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 32px',
            background: '#2A1D16',
            color: KREM,
            fontSize: 24,
          }}
        >
          <div style={{ display: 'flex' }}>Pesan online · bayar tunai / QRIS</div>
          <div style={{ display: 'flex', color: '#D9A03C' }}>{situs.replace(/^https?:\/\//, '')}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
