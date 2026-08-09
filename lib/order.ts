'use client';

import { push, ref, runTransaction, serverTimestamp, update } from 'firebase/database';
import { getDb } from './firebase';
import type { Order, OrderItem } from './types';

export type OrderInput = {
  tipe: 'reguler' | 'custom';
  nama: string;
  wa: string;
  items: OrderItem[];
  permintaan?: string;
  jumlahPorsi?: number;
  tanggalAmbil: string;
  jamAmbil?: string;
  metodeBayar: 'tunai' | 'qris';
  catatan?: string;
};

function kodeHari() {
  const t = new Date();
  return `${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, '0')}${String(t.getDate()).padStart(2, '0')}`;
}

/**
 * Simpan pesanan ke Realtime Database DULU, baru buka WhatsApp.
 * Nomor urut dibuat lewat transaction supaya dua pemesan barengan
 * tidak pernah dapat kode yang sama.
 */
export async function buatPesanan(input: OrderInput): Promise<Order> {
  const hari = kodeHari();
  const hasil = await runTransaction(ref(getDb(), `counters/${hari}`), (kini) => (kini || 0) + 1);
  const urut = Number(hasil.snapshot.val() || 1);
  const kode = `PMI-${hari.slice(6, 8)}${hari.slice(4, 6)}-${String(urut).padStart(3, '0')}`;

  const total = input.items.reduce((n, i) => n + i.harga * i.qty, 0);

  const data = {
    kode,
    tipe: input.tipe,
    nama: input.nama.trim(),
    wa: input.wa.trim(),
    items: input.items,
    permintaan: input.permintaan?.trim() || null,
    jumlahPorsi: input.jumlahPorsi || null,
    tanggalAmbil: input.tanggalAmbil,
    jamAmbil: input.jamAmbil || null,
    metodeBayar: input.metodeBayar,
    catatan: input.catatan?.trim() || null,
    total,
    status: 'baru' as const,
    createdAt: serverTimestamp(),
  };

  const referensi = await push(ref(getDb(), 'orders'), data);
  const id = referensi.key as string;

  return {
    id,
    kode,
    tipe: input.tipe,
    nama: data.nama,
    wa: data.wa,
    items: input.items,
    permintaan: input.permintaan,
    jumlahPorsi: input.jumlahPorsi,
    tanggalAmbil: input.tanggalAmbil,
    jamAmbil: input.jamAmbil,
    metodeBayar: input.metodeBayar,
    catatan: input.catatan,
    total,
    status: 'baru',
    createdAt: Date.now(),
  };
}

export async function ubahStatus(id: string, status: Order['status']) {
  await update(ref(getDb(), `orders/${id}`), { status, updatedAt: serverTimestamp() });
}
