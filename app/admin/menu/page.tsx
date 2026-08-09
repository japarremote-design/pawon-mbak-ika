'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { onValue, push, ref, remove, update } from 'firebase/database';
import { getDb } from '@/lib/firebase';
import { rupiah, thumb, uploadCloudinary } from '@/lib/utils';
import type { MenuItem } from '@/lib/types';

type Draf = Partial<MenuItem>;

export default function KelolaMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [draf, setDraf] = useState<Draf | null>(null);
  const [unggah, setUnggah] = useState(false);
  const [galat, setGalat] = useState('');

  useEffect(() => {
    const off = onValue(ref(getDb(), 'menu'), (snap) => {
      const v = (snap.val() as Record<string, Omit<MenuItem, 'id'>> | null) || {};
      setMenu(
        Object.entries(v)
          .map(([id, m]) => ({ id, ...m }))
          .sort((a, b) => (a.urutan ?? 999) - (b.urutan ?? 999) || a.nama.localeCompare(b.nama)),
      );
    });
    return () => off();
  }, []);

  const toggle = (m: MenuItem) => update(ref(getDb(), `menu/${m.id}`), { aktif: !m.aktif });

  const semua = (aktif: boolean) => {
    const isi: Record<string, boolean> = {};
    menu.forEach((m) => (isi[`${m.id}/aktif`] = aktif));
    return update(ref(getDb(), 'menu'), isi);
  };

  const simpan = async () => {
    if (!draf) return;
    setGalat('');
    if (!draf.nama?.trim()) return setGalat('Nama menu wajib diisi.');
    if (!draf.harga || draf.harga < 0) return setGalat('Harga belum benar.');

    const isi = {
      nama: draf.nama.trim(),
      deskripsi: draf.deskripsi?.trim() || null,
      harga: Number(draf.harga),
      gambarUrl: draf.gambarUrl || null,
      kategori: draf.kategori?.trim() || null,
      aktif: draf.aktif ?? true,
      stok: draf.stok === undefined || draf.stok === null || Number.isNaN(draf.stok) ? null : Number(draf.stok),
      urutan: draf.urutan ?? menu.length + 1,
    };

    if (draf.id) await update(ref(getDb(), `menu/${draf.id}`), isi);
    else await push(ref(getDb(), 'menu'), { ...isi, createdAt: Date.now() });
    setDraf(null);
  };

  const hapus = async (m: MenuItem) => {
    if (confirm(`Hapus "${m.nama}" dari daftar menu?`)) await remove(ref(getDb(), `menu/${m.id}`));
  };

  const pilihGambar = async (file?: File | null) => {
    if (!file || !draf) return;
    setUnggah(true);
    setGalat('');
    try {
      const url = await uploadCloudinary(file);
      setDraf({ ...draf, gambarUrl: url });
    } catch (e: any) {
      setGalat(e?.message || 'Gambar gagal diunggah.');
    } finally {
      setUnggah(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Menu</h1>
          <p className="text-sm text-ink/70">
            Geser tombolnya untuk membuka atau menutup menu di halaman depan. Perubahan langsung
            terlihat pelanggan.
          </p>
        </div>
        <button
          onClick={() => setDraf({ aktif: true, harga: 0 })}
          className="btn-utama px-4 py-2 text-sm"
        >
          + Menu baru
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => semua(true)} className="btn-garis px-4 py-2 text-sm">
          Buka semua
        </button>
        <button onClick={() => semua(false)} className="btn-garis px-4 py-2 text-sm">
          Tutup semua
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {menu.map((m) => (
          <article key={m.id} className="kartu flex items-center gap-3">
            {m.gambarUrl ? (
              <Image
                src={thumb(m.gambarUrl, 200)}
                alt=""
                width={72}
                height={72}
                className="h-18 w-18 shrink-0 rounded-xl object-cover"
                style={{ width: 72, height: 72 }}
                unoptimized
              />
            ) : (
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl bg-daun/10 text-2xl">
                🍚
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-lg font-bold">{m.nama}</h2>
              <p className="text-sm text-ink/70">
                {rupiah(m.harga)}
                {typeof m.stok === 'number' ? ` · sisa ${m.stok}` : ''}
              </p>
              <div className="mt-1 flex gap-3 text-xs font-semibold">
                <button onClick={() => setDraf(m)} className="text-daun hover:underline">
                  Ubah
                </button>
                <button onClick={() => hapus(m)} className="text-sambal hover:underline">
                  Hapus
                </button>
              </div>
            </div>

            <button
              role="switch"
              aria-checked={m.aktif}
              aria-label={`${m.aktif ? 'Tutup' : 'Buka'} menu ${m.nama}`}
              onClick={() => toggle(m)}
              className={`relative h-9 w-16 shrink-0 rounded-full transition ${
                m.aktif ? 'bg-daunmuda' : 'bg-ink/20'
              }`}
            >
              <span
                className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${
                  m.aktif ? 'left-8' : 'left-1'
                }`}
              />
            </button>
          </article>
        ))}

        {menu.length === 0 && (
          <p className="kartu text-center text-ink/60">
            Belum ada menu. Tekan “Menu baru” untuk mulai mengisi.
          </p>
        )}
      </div>

      {draf && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/70 sm:items-center sm:p-4">
          <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-paper p-5 sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-extrabold">
                {draf.id ? 'Ubah menu' : 'Menu baru'}
              </h3>
              <button onClick={() => setDraf(null)} className="text-2xl leading-none text-ink/50">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Nama</label>
                <input
                  className="input"
                  value={draf.nama || ''}
                  onChange={(e) => setDraf({ ...draf, nama: e.target.value })}
                  placeholder="Nasi rawon + telur asin"
                />
              </div>
              <div>
                <label className="label">Keterangan singkat</label>
                <input
                  className="input"
                  value={draf.deskripsi || ''}
                  onChange={(e) => setDraf({ ...draf, deskripsi: e.target.value })}
                  placeholder="Kuah kluwek, daging sandung lamur"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Harga (Rp)</label>
                  <input
                    type="number"
                    className="input"
                    value={draf.harga ?? 0}
                    onChange={(e) => setDraf({ ...draf, harga: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Sisa porsi</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="kosongkan = bebas"
                    value={draf.stok ?? ''}
                    onChange={(e) =>
                      setDraf({ ...draf, stok: e.target.value === '' ? null : Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="label">Foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => pilihGambar(e.target.files?.[0])}
                  className="w-full text-sm"
                />
                {unggah && <p className="mt-1 text-sm text-ink/60">Mengunggah…</p>}
                {draf.gambarUrl && (
                  <Image
                    src={thumb(draf.gambarUrl, 400)}
                    alt=""
                    width={400}
                    height={240}
                    className="mt-2 h-36 w-full rounded-xl object-cover"
                    unoptimized
                  />
                )}
              </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={draf.aktif ?? true}
                  onChange={(e) => setDraf({ ...draf, aktif: e.target.checked })}
                />
                <span className="text-sm font-semibold text-daun">Tampilkan di menu hari ini</span>
              </label>

              {galat && <p className="text-sm font-semibold text-sambal">{galat}</p>}

              <button onClick={simpan} className="btn-utama w-full">
                Simpan menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
