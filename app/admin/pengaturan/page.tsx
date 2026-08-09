'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { onValue, ref, update } from 'firebase/database';
import { getDb } from '@/lib/firebase';
import { normalWa, uploadCloudinary } from '@/lib/utils';
import { DEFAULT_SETTINGS, type Settings } from '@/lib/types';

const TEKS: { k: keyof Settings; label: string; petunjuk?: string; area?: boolean }[] = [
  { k: 'namaUsaha', label: 'Nama usaha' },
  { k: 'tagline', label: 'Kalimat besar di halaman depan' },
  { k: 'deskripsi', label: 'Deskripsi singkat (dipakai juga untuk preview share)', area: true },
  { k: 'wa', label: 'Nomor WhatsApp', petunjuk: 'Boleh ditulis 0813… nanti dirapikan sendiri.' },
  { k: 'alamat', label: 'Alamat' },
  { k: 'jamBuka', label: 'Jam buka' },
  { k: 'batasPesan', label: 'Batas waktu pesan' },
  {
    k: 'jamGantiMenu',
    label: 'Jam papan menu pindah ke besok (HH:MM)',
    petunjuk: 'Contoh 13:00 — mulai jam segitu papan menampilkan menu besok, dan pesanan yang masuk dihitung untuk besok.',
  },
  { k: 'ongkir', label: 'Keterangan ongkir', petunjuk: 'Muncul saat pemesan memilih dikirim kurir.' },
  { k: 'wilayahAntar', label: 'Wilayah yang dilayani kurir' },
  { k: 'qrisNama', label: 'Nama pemilik QRIS' },
  { k: 'instagram', label: 'Link Instagram' },
  { k: 'facebook', label: 'Link Facebook' },
  { k: 'tiktok', label: 'Link TikTok' },
  { k: 'telegram', label: 'Link Telegram' },
  { k: 'x', label: 'Link X (Twitter)' },
  { k: 'youtube', label: 'Link YouTube' },
  { k: 'threads', label: 'Link Threads' },
  { k: 'poweredByNama', label: 'Nama pembuat di footer' },
  { k: 'poweredByUrl', label: 'Link pembuat di footer' },
];

export default function Pengaturan() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  const [pesan, setPesan] = useState('');
  const [unggah, setUnggah] = useState<'logo' | 'qris' | null>(null);

  useEffect(() => {
    const off = onValue(ref(getDb(), 'settings'), (snap) => {
      setS({ ...DEFAULT_SETTINGS, ...(snap.val() || {}) });
    });
    return () => off();
  }, []);

  const simpan = async () => {
    const bersih: Record<string, any> = {};
    (Object.keys(s) as (keyof Settings)[]).forEach((k) => {
      const v = s[k];
      bersih[k] = typeof v === 'string' ? v.trim() || null : (v ?? null);
    });
    bersih.wa = normalWa(s.wa);
    await update(ref(getDb(), 'settings'), bersih);
    setPesan('Pengaturan tersimpan.');
    setTimeout(() => setPesan(''), 2500);
  };

  const gambar = async (jenis: 'logo' | 'qris', file?: File | null) => {
    if (!file) return;
    setUnggah(jenis);
    try {
      const url = await uploadCloudinary(file);
      setS((v) => ({ ...v, [jenis === 'logo' ? 'logoUrl' : 'qrisUrl']: url }));
      setPesan('Gambar terunggah. Jangan lupa tekan Simpan.');
    } catch (e: any) {
      setPesan(e?.message || 'Gambar gagal diunggah.');
    } finally {
      setUnggah(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Pengaturan</h1>
      <p className="text-sm text-ink/70">
        Semua yang tampil di halaman depan diatur dari sini — tidak perlu ubah kode.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {(['logo', 'qris'] as const).map((jenis) => {
          const url = jenis === 'logo' ? s.logoUrl : s.qrisUrl;
          return (
            <div key={jenis} className="kartu">
              <p className="label">{jenis === 'logo' ? 'Logo usaha' : 'Kode QRIS'}</p>
              {url ? (
                <Image
                  src={url}
                  alt=""
                  width={300}
                  height={300}
                  className="mb-3 h-40 w-full rounded-xl bg-white object-contain p-2"
                  unoptimized
                />
              ) : (
                <div className="mb-3 flex h-40 items-center justify-center rounded-xl border border-dashed border-daun/30 text-sm text-ink/50">
                  Belum ada gambar
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm"
                onChange={(e) => gambar(jenis, e.target.files?.[0])}
              />
              {unggah === jenis && <p className="mt-1 text-sm text-ink/60">Mengunggah…</p>}
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-4">
        {TEKS.map((f) => (
          <div key={f.k}>
            <label className="label">{f.label}</label>
            {f.area ? (
              <textarea
                className="input min-h-[90px]"
                value={(s[f.k] as string) || ''}
                onChange={(e) => setS({ ...s, [f.k]: e.target.value })}
              />
            ) : (
              <input
                className="input"
                value={(s[f.k] as string) || ''}
                onChange={(e) => setS({ ...s, [f.k]: e.target.value })}
              />
            )}
            {f.petunjuk && <p className="mt-1 text-xs text-ink/55">{f.petunjuk}</p>}
          </div>
        ))}
      </div>

      {pesan && <p className="mt-4 text-sm font-semibold text-daunmuda">{pesan}</p>}

      <button onClick={simpan} className="btn-utama mt-4 w-full sm:w-auto">
        Simpan pengaturan
      </button>
    </div>
  );
}
