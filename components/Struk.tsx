'use client';

import { useEffect, useState } from 'react';
import { pesanWa, rupiah, tanggalPanjang, waLink } from '@/lib/utils';
import type { Order, Settings } from '@/lib/types';

export default function Struk({
  order,
  settings,
  onTutup,
}: {
  order: Order;
  settings: Settings;
  onTutup: () => void;
}) {
  const [urlCek, setUrlCek] = useState('');

  useEffect(() => {
    setUrlCek(`${window.location.origin}/pesanan/${order.id}`);
  }, [order.id]);

  const tautanWa = waLink(settings.wa, pesanWa(order, settings, urlCek));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 p-4 py-8">
      <div className="w-full max-w-sm animate-naik">
        <div className="struk px-5 pb-8 pt-6 text-[13px] leading-relaxed">
          <div className="text-center">
            <p className="font-display text-lg font-extrabold tracking-tight">
              {settings.namaUsaha.toUpperCase()}
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink/60">Bukti pesanan</p>
          </div>

          <div className="garis-putus my-4" />

          <p className="text-center text-2xl font-bold tracking-tight text-sambal">{order.kode}</p>
          <p className="mt-1 text-center text-[11px] text-ink/60">
            Sebut kode ini kalau ada yang perlu dicek
          </p>

          <div className="garis-putus my-4" />

          <div className="space-y-1">
            <p>NAMA : {order.nama}</p>
            <p>WA&nbsp;&nbsp; : {order.wa}</p>
            <p>AMBIL: {tanggalPanjang(order.tanggalAmbil)}</p>
            {order.jamAmbil && <p>JAM&nbsp;&nbsp;: {order.jamAmbil}</p>}
            <p>BAYAR: {order.metodeBayar === 'qris' ? 'QRIS' : 'TUNAI'}</p>
          </div>

          <div className="garis-putus my-4" />

          {order.items.length > 0 && (
            <table className="w-full">
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.menuId} className="align-top">
                    <td className="pr-2">
                      {i.nama}
                      <br />
                      <span className="text-ink/60">
                        {i.qty} x {rupiah(i.harga)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-right">{rupiah(i.harga * i.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {order.permintaan && (
            <div className="whitespace-pre-wrap">
              <p className="font-bold">PESANAN KHUSUS</p>
              <p>{order.permintaan}</p>
              {order.jumlahPorsi ? <p>Jumlah: {order.jumlahPorsi} porsi</p> : null}
              <p className="text-ink/60">Harga dikonfirmasi Mbak Ika lewat WA.</p>
            </div>
          )}

          {order.catatan && <p className="mt-3">CATATAN: {order.catatan}</p>}

          <div className="garis-putus my-4" />

          <div className="flex items-baseline justify-between text-base font-bold">
            <span>TOTAL</span>
            <span>{order.items.length ? rupiah(order.total) : '—'}</span>
          </div>

          <div className="garis-putus my-4" />

          <p className="text-center text-[11px] text-ink/60">
            Pesanan sudah tercatat otomatis di buku pesanan Mbak Ika. Tidak dihitung manual lagi.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <a
            href={tautanWa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn w-full bg-[#25D366] text-white"
          >
            Kirim ke WhatsApp Mbak Ika
          </a>
          <a
            href={`/pesanan/${order.id}`}
            className="btn w-full border-2 border-paper/50 text-paper hover:bg-paper hover:text-daun"
          >
            Lihat status pesanan
          </a>
          <button onClick={onTutup} className="btn w-full text-paper/80 hover:text-paper">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
