'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { getDb } from '@/lib/firebase';
import { buatPesanan } from '@/lib/order';
import { rupiah, tanggalPanjang, thumb } from '@/lib/utils';
import type { MenuItem, Order, Settings } from '@/lib/types';
import FormPemesan, { pemesanKosong, type DataPemesan } from './FormPemesan';
import Struk from './Struk';

function habis(m: MenuItem) {
  return !m.aktif || (typeof m.stok === 'number' && m.stok <= 0);
}

export default function PapanMenu({
  menuAwal,
  settings,
}: {
  menuAwal: MenuItem[];
  settings: Settings;
}) {
  const [menu, setMenu] = useState<MenuItem[]>(menuAwal);
  const [keranjang, setKeranjang] = useState<Record<string, number>>({});
  const [bukaForm, setBukaForm] = useState(false);
  const [pemesan, setPemesan] = useState<DataPemesan>(pemesanKosong);
  const [kirim, setKirim] = useState(false);
  const [galat, setGalat] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  // menu ikut berubah seketika saat Mbak Ika menggeser toggle di panel admin
  useEffect(() => {
    const off = onValue(ref(getDb(), 'menu'), (snap) => {
      const v = snap.val() as Record<string, Omit<MenuItem, 'id'>> | null;
      if (!v) return setMenu([]);
      setMenu(
        Object.entries(v)
          .map(([id, m]) => ({ id, ...m }))
          .sort((a, b) => (a.urutan ?? 999) - (b.urutan ?? 999) || a.nama.localeCompare(b.nama)),
      );
    });
    return () => off();
  }, []);

  const tersedia = menu.filter((m) => !habis(m));
  const kosong = menu.filter(habis);

  const isi = useMemo(
    () =>
      Object.entries(keranjang)
        .map(([id, qty]) => {
          const m = menu.find((x) => x.id === id);
          return m ? { menuId: id, nama: m.nama, harga: m.harga, qty } : null;
        })
        .filter(Boolean) as { menuId: string; nama: string; harga: number; qty: number }[],
    [keranjang, menu],
  );

  const total = isi.reduce((n, i) => n + i.harga * i.qty, 0);
  const jumlah = isi.reduce((n, i) => n + i.qty, 0);

  const ubahQty = (m: MenuItem, delta: number) => {
    setKeranjang((k) => {
      const batas = typeof m.stok === 'number' ? m.stok : 99;
      const baru = Math.max(0, Math.min(batas, (k[m.id] || 0) + delta));
      const salin = { ...k };
      if (baru === 0) delete salin[m.id];
      else salin[m.id] = baru;
      return salin;
    });
  };

  const simpan = async () => {
    setGalat('');
    if (!pemesan.nama.trim()) return setGalat('Isi nama dulu ya.');
    if (pemesan.wa.replace(/\D/g, '').length < 9) return setGalat('Nomor WhatsApp belum benar.');
    if (!isi.length) return setGalat('Belum ada menu yang dipilih.');
    setKirim(true);
    try {
      const hasil = await buatPesanan({
        tipe: 'reguler',
        nama: pemesan.nama,
        wa: pemesan.wa,
        items: isi,
        tanggalAmbil: pemesan.tanggalAmbil,
        jamAmbil: pemesan.jamAmbil,
        metodeBayar: pemesan.metodeBayar,
        catatan: pemesan.catatan,
      });
      setOrder(hasil);
      setBukaForm(false);
      setKeranjang({});
      setPemesan(pemesanKosong);
    } catch (e: any) {
      setGalat(e?.message || 'Pesanan gagal disimpan. Coba lagi sebentar.');
    } finally {
      setKirim(false);
    }
  };

  return (
    <section id="menu" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="papan p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-kunyit">Papan menu</p>
            <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              Masakan hari ini
            </h2>
            <p className="mt-1 text-sm text-paper/70">{tanggalPanjang(new Date())}</p>
          </div>
          <p className="rounded-full bg-paper/10 px-4 py-2 text-sm">
            {tersedia.length > 0 ? `${tersedia.length} menu siap` : 'Belum ada menu dibuka'}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tersedia.map((m) => {
            const qty = keranjang[m.id] || 0;
            return (
              <article
                key={m.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-kertas text-ink"
              >
                {m.gambarUrl ? (
                  <Image
                    src={thumb(m.gambarUrl)}
                    alt={m.nama}
                    width={600}
                    height={420}
                    className="h-40 w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-daun/10 text-5xl">
                    🍚
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-lg font-bold leading-snug">{m.nama}</h3>
                  {m.deskripsi && <p className="mt-1 text-sm text-ink/70">{m.deskripsi}</p>}
                  {typeof m.stok === 'number' && m.stok <= 5 && (
                    <p className="mt-2 text-xs font-bold uppercase tracking-wide text-sambal">
                      Sisa {m.stok} porsi
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="font-display text-lg font-extrabold">{rupiah(m.harga)}</span>
                    {qty === 0 ? (
                      <button onClick={() => ubahQty(m, 1)} className="btn-utama px-4 py-2 text-sm">
                        Pesan
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 rounded-full border-2 border-daun px-2 py-1">
                        <button
                          onClick={() => ubahQty(m, -1)}
                          aria-label={`Kurangi ${m.nama}`}
                          className="h-8 w-8 text-xl font-bold text-daun"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-bold">{qty}</span>
                        <button
                          onClick={() => ubahQty(m, 1)}
                          aria-label={`Tambah ${m.nama}`}
                          className="h-8 w-8 text-xl font-bold text-daun"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {tersedia.length === 0 && (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-paper/30 p-8 text-center">
              <p className="font-display text-xl font-bold">Menu hari ini belum dibuka</p>
              <p className="mt-2 text-sm text-paper/70">
                Mbak Ika biasanya membuka papan menu pagi hari. Sementara itu kamu tetap bisa pesan
                lewat kolom pesanan khusus di bawah.
              </p>
            </div>
          )}
        </div>

        {kosong.length > 0 && (
          <details className="mt-6 rounded-2xl bg-paper/5 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-paper/80">
              Menu yang sedang tidak tersedia ({kosong.length})
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {kosong.map((m) => (
                <div
                  key={m.id}
                  className="relative overflow-hidden rounded-xl bg-paper/5 p-3 opacity-70"
                >
                  <p className="font-semibold line-through decoration-sambal/70">{m.nama}</p>
                  <p className="text-sm text-paper/60">{rupiah(m.harga)}</p>
                  <span className="stempel right-3 top-4 text-sm">HABIS</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-paper/60">
              Mau salah satunya untuk besok? Pakai kolom pesanan khusus di bawah.
            </p>
          </details>
        )}
      </div>

      {/* keranjang menempel di bawah */}
      {jumlah > 0 && !bukaForm && !order && (
        <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-30 w-[min(100%-2rem,32rem)] -translate-x-1/2 animate-naik">
          <button
            onClick={() => setBukaForm(true)}
            className="flex w-full items-center justify-between rounded-full bg-ink px-5 py-4 text-paper shadow-papan"
          >
            <span className="text-sm">
              {jumlah} porsi · <b>{rupiah(total)}</b>
            </span>
            <span className="rounded-full bg-sambal px-4 py-2 text-sm font-bold">Lanjut pesan</span>
          </button>
        </div>
      )}

      {bukaForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/70 sm:items-center sm:p-4">
          <div className="max-h-[92dvh] w-full max-w-md animate-naik overflow-y-auto rounded-t-3xl bg-paper p-5 sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-extrabold">Data pemesan</h3>
              <button onClick={() => setBukaForm(false)} className="text-2xl leading-none text-ink/50">
                ×
              </button>
            </div>

            <ul className="mb-4 space-y-1 rounded-xl bg-white p-3 text-sm">
              {isi.map((i) => (
                <li key={i.menuId} className="flex justify-between">
                  <span>
                    {i.nama} <span className="text-ink/50">x{i.qty}</span>
                  </span>
                  <span>{rupiah(i.harga * i.qty)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-daun/15 pt-2 font-bold">
                <span>Total</span>
                <span>{rupiah(total)}</span>
              </li>
            </ul>

            <FormPemesan nilai={pemesan} ubah={setPemesan} settings={settings} />

            {galat && <p className="mt-3 text-sm font-semibold text-sambal">{galat}</p>}

            <button onClick={simpan} disabled={kirim} className="btn-utama mt-5 w-full disabled:opacity-60">
              {kirim ? 'Menyimpan…' : 'Simpan pesanan & kirim ke WA'}
            </button>
            <p className="mt-2 text-center text-xs text-ink/60">
              Pesanan disimpan dulu ke buku pesanan, baru dikirim ke WhatsApp.
            </p>
          </div>
        </div>
      )}

      {order && <Struk order={order} settings={settings} onTutup={() => setOrder(null)} />}
    </section>
  );
}
