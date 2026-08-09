import type { Order, Settings } from './types';

export const rupiah = (n: number) =>
  'Rp' + new Intl.NumberFormat('id-ID').format(Math.round(n || 0));

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function tanggalPanjang(d: Date | string) {
  const t = typeof d === 'string' ? new Date(d + 'T00:00:00') : d;
  if (Number.isNaN(t.getTime())) return String(d);
  return `${HARI[t.getDay()]}, ${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
}

export function tanggalPendek(ms: number) {
  const t = new Date(ms);
  return `${String(t.getDate()).padStart(2, '0')}/${String(t.getMonth() + 1).padStart(2, '0')} ${String(
    t.getHours(),
  ).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
}

export function isoHariIni(offsetHari = 0) {
  const t = new Date();
  t.setDate(t.getDate() + offsetHari);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

/** 08133151846 / +62 813-3151-8468 → 6281331518468 */
export function normalWa(nomor: string) {
  let n = (nomor || '').replace(/[^0-9]/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  if (n.startsWith('8')) n = '62' + n;
  return n;
}

export function waLink(nomor: string, pesan: string) {
  return `https://wa.me/${normalWa(nomor)}?text=${encodeURIComponent(pesan)}`;
}

/** Teks pesanan yang dikirim ke WA — sama persis dengan yang tersimpan di database. */
export function pesanWa(order: Omit<Order, 'id'>, s: Settings, urlCek: string) {
  const baris: string[] = [];
  baris.push(`*PESANAN ${s.namaUsaha.toUpperCase()}*`);
  baris.push(`Kode: *${order.kode}*`);
  baris.push('');
  baris.push(`Nama: ${order.nama}`);
  baris.push(`Ambil/kirim: ${tanggalPanjang(order.tanggalAmbil)}${order.jamAmbil ? ' jam ' + order.jamAmbil : ''}`);
  baris.push('');
  if (order.items.length) {
    baris.push('Rincian:');
    order.items.forEach((i, idx) => {
      baris.push(`${idx + 1}. ${i.nama} x${i.qty} = ${rupiah(i.harga * i.qty)}`);
    });
    baris.push(`*Total: ${rupiah(order.total)}*`);
  }
  if (order.permintaan) {
    baris.push('Pesanan di luar daftar menu:');
    baris.push(order.permintaan);
    if (order.jumlahPorsi) baris.push(`Jumlah: ${order.jumlahPorsi} porsi`);
    baris.push('(harga menyusul dari Mbak Ika)');
  }
  baris.push('');
  baris.push(`Bayar: ${order.metodeBayar === 'qris' ? 'QRIS' : 'Tunai'}`);
  if (order.catatan) baris.push(`Catatan: ${order.catatan}`);
  baris.push('');
  baris.push(`Pesanan ini sudah tercatat otomatis di: ${urlCek}`);
  return baris.join('\n');
}

/** Upload ke Cloudinary lewat unsigned upload preset. */
export async function uploadCloudinary(file: File): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) {
    throw new Error('Cloudinary belum diatur. Isi NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);
  form.append('folder', 'pawon_mbak_ika');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data?.error?.message || 'Gambar gagal diunggah.');
  }
  return data.secure_url as string;
}

/** Versi kecil gambar Cloudinary biar hemat kuota HP pelanggan. */
export function thumb(url?: string, w = 600) {
  if (!url) return '';
  return url.includes('/upload/')
    ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${w},c_fill,g_auto/`)
    : url;
}
