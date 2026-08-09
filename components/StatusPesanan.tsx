'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { getDb } from '@/lib/firebase';
import { rupiah, tanggalPanjang, waLink } from '@/lib/utils';
import type { Order, Settings } from '@/lib/types';

const WARNA: Record<Order['status'], string> = {
  baru: 'bg-kunyit text-ink',
  dikonfirmasi: 'bg-daunmuda text-white',
  diproses: 'bg-daun text-paper',
  selesai: 'bg-daun text-paper',
  batal: 'bg-sambal text-white',
};

const KETERANGAN: Record<Order['status'], string> = {
  baru: 'Sudah masuk buku pesanan, menunggu dikonfirmasi Mbak Ika.',
  dikonfirmasi: 'Sudah dikonfirmasi. Masuk daftar masak.',
  diproses: 'Sedang dimasak.',
  selesai: 'Selesai. Terima kasih!',
  batal: 'Pesanan dibatalkan. Hubungi Mbak Ika kalau ini keliru.',
};

export default function StatusPesanan({ id, settings }: { id: string; settings: Settings }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [muat, setMuat] = useState(true);

  useEffect(() => {
    const off = onValue(
      ref(getDb(), `orders/${id}`),
      (snap) => {
        const v = snap.val();
        setOrder(v ? ({ id, ...v } as Order) : null);
        setMuat(false);
      },
      () => setMuat(false),
    );
    return () => off();
  }, [id]);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-daun hover:underline">
        ← Kembali ke menu
      </Link>

      {muat && <p className="mt-8 text-center text-ink/60">Membuka pesanan…</p>}

      {!muat && !order && (
        <div className="kartu mt-8 text-center">
          <h1 className="font-display text-xl font-bold">Pesanan tidak ditemukan</h1>
          <p className="mt-2 text-sm text-ink/70">
            Link-nya mungkin salah ketik. Kirim kode pesananmu ke WhatsApp, nanti dicarikan.
          </p>
          <a
            href={waLink(settings.wa, 'Halo, saya mau cek status pesanan saya.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-utama mt-4 w-full"
          >
            Chat Mbak Ika
          </a>
        </div>
      )}

      {order && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-daunmuda">Kode pesanan</p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">{order.kode}</h1>

          <span
            className={`mt-3 inline-block rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide ${WARNA[order.status]}`}
          >
            {order.status}
          </span>
          <p className="mt-2 text-sm text-ink/70">{KETERANGAN[order.status]}</p>

          <div className="kartu mt-5 space-y-1 text-sm">
            <p>
              <b>{order.nama}</b> · {order.wa}
            </p>
            <p>
              Ambil {tanggalPanjang(order.tanggalAmbil)}
              {order.jamAmbil ? ` jam ${order.jamAmbil}` : ''}
            </p>
            <p>Bayar {order.metodeBayar === 'qris' ? 'QRIS' : 'tunai'}</p>
          </div>

          <div className="kartu mt-4">
            {order.items?.length ? (
              <ul className="space-y-1 text-sm">
                {order.items.map((i) => (
                  <li key={i.menuId} className="flex justify-between">
                    <span>
                      {i.nama} <span className="text-ink/50">x{i.qty}</span>
                    </span>
                    <span>{rupiah(i.harga * i.qty)}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-daun/15 pt-2 font-bold">
                  <span>Total</span>
                  <span>{rupiah(order.total)}</span>
                </li>
              </ul>
            ) : (
              <div className="whitespace-pre-wrap text-sm">
                <p className="font-bold">Pesanan khusus</p>
                <p>{order.permintaan}</p>
                {order.jumlahPorsi ? <p>{order.jumlahPorsi} porsi</p> : null}
              </div>
            )}
            {order.catatan && <p className="mt-3 text-sm text-ink/70">Catatan: {order.catatan}</p>}
          </div>

          <a
            href={waLink(settings.wa, `Halo, saya mau tanya pesanan kode ${order.kode}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-5 w-full bg-[#25D366] text-white"
          >
            Tanya lewat WhatsApp
          </a>
        </div>
      )}
    </main>
  );
}
