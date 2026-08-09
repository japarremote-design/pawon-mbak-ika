'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { onValue, query, limitToLast, ref } from 'firebase/database';
import { getDb } from '@/lib/firebase';
import { ubahStatus } from '@/lib/order';
import { isoHariIni, rupiah, tanggalPanjang, tanggalPendek, waLink } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/types';

const STATUS: OrderStatus[] = ['baru', 'dikonfirmasi', 'diproses', 'selesai', 'batal'];

function bunyiBel() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch {
    /* browser tidak mengizinkan suara sebelum ada interaksi */
  }
}

export default function Pesanan() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [saring, setSaring] = useState<'aktif' | 'semua' | OrderStatus>('aktif');
  const [tanggal, setTanggal] = useState('');
  const jumlahAwal = useRef<number | null>(null);

  useEffect(() => {
    const off = onValue(query(ref(getDb(), 'orders'), limitToLast(300)), (snap) => {
      const v = (snap.val() as Record<string, Omit<Order, 'id'>> | null) || {};
      const daftar = Object.entries(v)
        .map(([id, o]) => ({ id, ...o }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      if (jumlahAwal.current !== null && daftar.length > jumlahAwal.current) {
        bunyiBel();
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Pesanan baru masuk', { body: daftar[0]?.nama || '' });
        }
      }
      jumlahAwal.current = daftar.length;
      setOrders(daftar);
    });
    return () => off();
  }, []);

  const tersaring = useMemo(() => {
    return orders.filter((o) => {
      if (tanggal && o.tanggalAmbil !== tanggal) return false;
      if (saring === 'semua') return true;
      if (saring === 'aktif') return o.status !== 'selesai' && o.status !== 'batal';
      return o.status === saring;
    });
  }, [orders, saring, tanggal]);

  const rekapHariIni = useMemo(() => {
    const hari = isoHariIni();
    const isi = orders.filter((o) => o.tanggalAmbil === hari && o.status !== 'batal');
    const porsi = isi.reduce(
      (n, o) => n + (o.items?.reduce((x, i) => x + i.qty, 0) || o.jumlahPorsi || 0),
      0,
    );
    const uang = isi.reduce((n, o) => n + (o.total || 0), 0);
    return { pesanan: isi.length, porsi, uang };
  }, [orders]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold">Buku pesanan</h1>
        <button
          onClick={() => 'Notification' in window && Notification.requestPermission()}
          className="text-sm font-semibold text-daun hover:underline"
        >
          Aktifkan notifikasi
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ['Pesanan hari ini', String(rekapHariIni.pesanan)],
          ['Total porsi', String(rekapHariIni.porsi)],
          ['Perkiraan uang', rupiah(rekapHariIni.uang)],
        ].map(([t, v]) => (
          <div key={t} className="kartu">
            <p className="text-xs uppercase tracking-wide text-daunmuda">{t}</p>
            <p className="font-display text-xl font-extrabold">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {(['aktif', ...STATUS, 'semua'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSaring(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${
              saring === s ? 'bg-daun text-paper' : 'bg-white text-daun'
            }`}
          >
            {s}
          </button>
        ))}
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="rounded-full border border-daun/25 bg-white px-3 py-1.5 text-sm"
        />
        {tanggal && (
          <button onClick={() => setTanggal('')} className="text-sm text-sambal">
            hapus filter
          </button>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {tersaring.map((o) => (
          <article key={o.id} className="kartu">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-struk text-sm text-sambal">{o.kode}</p>
                <h2 className="font-display text-lg font-bold">{o.nama}</h2>
                <p className="text-sm text-ink/70">
                  Ambil {tanggalPanjang(o.tanggalAmbil)}
                  {o.jamAmbil ? ` · ${o.jamAmbil}` : ''} · bayar{' '}
                  {o.metodeBayar === 'qris' ? 'QRIS' : 'tunai'}
                </p>
                <p className="text-xs text-ink/50">Masuk {tanggalPendek(o.createdAt || 0)}</p>
              </div>
              <span className="rounded-full bg-kunyit/30 px-3 py-1 text-xs font-bold uppercase">
                {o.status}
              </span>
            </div>

            {o.items?.length ? (
              <ul className="mt-3 space-y-0.5 text-sm">
                {o.items.map((i) => (
                  <li key={i.menuId} className="flex justify-between">
                    <span>
                      {i.nama} <b>x{i.qty}</b>
                    </span>
                    <span>{rupiah(i.harga * i.qty)}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-daun/15 pt-1 font-bold">
                  <span>Total</span>
                  <span>{rupiah(o.total)}</span>
                </li>
              </ul>
            ) : (
              <div className="mt-3 whitespace-pre-wrap rounded-xl bg-kunyit/15 p-3 text-sm">
                <b>Pesanan khusus{o.jumlahPorsi ? ` · ${o.jumlahPorsi} porsi` : ''}</b>
                <p>{o.permintaan}</p>
              </div>
            )}

            {o.catatan && <p className="mt-2 text-sm text-ink/70">Catatan: {o.catatan}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {STATUS.filter((s) => s !== o.status).map((s) => (
                <button
                  key={s}
                  onClick={() => ubahStatus(o.id, s)}
                  className="rounded-full border border-daun/30 px-3 py-1.5 text-xs font-semibold capitalize text-daun hover:bg-daun hover:text-paper"
                >
                  {s}
                </button>
              ))}
              <a
                href={waLink(o.wa, `Assalamualikum Wr. Wb. Halo ${o.nama}, pesanan ${o.kode} `)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white"
              >
                WA pemesan
              </a>
            </div>
          </article>
        ))}

        {tersaring.length === 0 && (
          <p className="kartu text-center text-ink/60">Belum ada pesanan di saringan ini.</p>
        )}
      </div>
    </div>
  );
}
