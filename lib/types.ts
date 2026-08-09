export type MenuItem = {
  id: string;
  nama: string;
  deskripsi?: string;
  harga: number;
  gambarUrl?: string;
  kategori?: string;
  /** Tampil di papan menu hari ini atau tidak (toggle admin). */
  aktif: boolean;
  /** Sisa porsi. null / undefined = tidak dibatasi. 0 = habis. */
  stok?: number | null;
  urutan?: number;
  createdAt?: number;
};

export type OrderItem = {
  menuId: string;
  nama: string;
  harga: number;
  qty: number;
};

export type OrderStatus = 'baru' | 'dikonfirmasi' | 'diproses' | 'selesai' | 'batal';

export type Order = {
  id: string;
  kode: string;
  tipe: 'reguler' | 'custom';
  nama: string;
  wa: string;
  items: OrderItem[];
  /** Untuk pesanan di luar daftar menu. */
  permintaan?: string;
  jumlahPorsi?: number;
  tanggalAmbil: string; // YYYY-MM-DD
  jamAmbil?: string;
  metodeBayar: 'tunai' | 'qris';
  catatan?: string;
  total: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt?: number;
};

export type Settings = {
  namaUsaha: string;
  tagline: string;
  deskripsi: string;
  logoUrl?: string;
  qrisUrl?: string;
  qrisNama?: string;
  wa: string; // 62813xxxxxxx
  alamat?: string;
  jamBuka?: string;
  batasPesan?: string; // mis. "Pesan sebelum jam 20.00 untuk besok"
  ongkir?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  telegram?: string;
  x?: string;
  youtube?: string;
  threads?: string;
  ogImage?: string;
  poweredByNama?: string;
  poweredByUrl?: string;
};

export const DEFAULT_SETTINGS: Settings = {
  namaUsaha: 'Pawon Mbak Ika',
  logoUrl: '/logo.png',
  tagline: 'Masak pagi, habis siang.',
  deskripsi:
    'Masakan tradisional Nusantara yang dimasak dadakan tiap pagi sejak 2010. Menunya ganti tiap hari, jadi cek dulu papan menu hari ini sebelum pesan.',
  wa: '6281331518468',
  jamBuka: 'Setiap hari, 06.00 - 14.00',
  batasPesan: 'Pesanan untuk besok ditutup jam 20.00',
  qrisNama: 'PAWON MBAK IKA',
  poweredByNama: 'QFAZ Digital',
  poweredByUrl: 'https://www.qfazdigital.my.id/',
};
