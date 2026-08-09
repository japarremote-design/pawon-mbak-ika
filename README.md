# Pawon Mbak Ika

Landing page + sistem pesanan untuk usaha kuliner rumahan yang menunya ganti tiap hari.
Next.js 14 (App Router) · Firebase Realtime Database · Cloudinary · deploy di Vercel.

---

## 1. Yang bikin beda: pesanan tidak dicatat manual

Alurnya sengaja dibalik dari kebiasaan lama:

1. Pelanggan pilih menu di web → isi nama, WA, tanggal ambil, cara bayar.
2. Pesanan **disimpan dulu ke database**, dapat kode urut `PMI-DDMM-NNN`.
   Nomor urutnya dibuat pakai *transaction*, jadi dua pemesan barengan tidak mungkin dapat kode sama.
3. Baru muncul struk + tombol **Kirim ke WhatsApp**, isinya sama persis dengan yang tercatat.

Jadi kalau pelanggan pesan 10, yang masuk ke buku pesanan juga 10 — tidak ada tulis ulang manual.
Pelanggan juga dapat link `/pesanan/<id>` untuk cek status pesanannya sendiri.

---

## 2. Siapkan Firebase

1. Buka [console.firebase.google.com](https://console.firebase.google.com) → **Add project** (misal `pawon-mbak-ika`).
2. **Build → Realtime Database → Create Database**. Pilih lokasi `asia-southeast1` (Singapura), mode **locked**.
   Salin URL-nya, bentuknya seperti
   `https://pawon-mbak-ika-default-rtdb.asia-southeast1.firebasedatabase.app`
3. **Build → Authentication → Get started → Email/Password → Enable.**
   Lalu tab **Users → Add user**: email `ika.indriyani81@gmail.com` + kata sandi. Ini yang dipakai login panel.
4. **Project settings → General → Your apps → Web (`</>`)**. Salin isi `firebaseConfig` untuk `.env`.

### Pasang security rules

Isi file `database.rules.json` sudah memakai email admin `ika.indriyani81@gmail.com`
dan `qfazdigital@gmail.com`. Tempel isinya di **Realtime Database → Rules → Publish**.
Kalau nanti mau menambah admin, tulis kondisi `||` lagi di setiap baris yang memuat email.

Ringkasan aturannya:

| Node | Baca | Tulis |
|---|---|---|
| `settings`, `menu` | siapa saja | hanya email admin |
| `orders` (seluruh daftar) | hanya admin | — |
| `orders/<id>` (satu pesanan) | siapa saja yang punya linknya | dibuat sekali oleh pemesan, diubah hanya admin |
| `counters/<tanggal>` | siapa saja | hanya boleh naik +1 |

Pesanan yang sudah masuk **tidak bisa diubah pemesan**, hanya admin. Ini penting supaya jumlahnya tidak bisa diutak-atik setelah dikirim.

---

## 3. Siapkan Cloudinary (untuk logo, QRIS, foto menu)

1. Daftar di [cloudinary.com](https://cloudinary.com), catat **Cloud name**.
2. **Settings → Upload → Upload presets → Add upload preset**
   · Signing Mode: **Unsigned**
   · Folder: `pawon_mbak_ika`
   · Simpan, catat nama presetnya.

Kalau dua nilai ini belum diisi, tombol unggah gambar akan memberi pesan error yang jelas — sisa aplikasi tetap jalan.

---

## 4. Isi `.env.local`

Salin `.env.example` jadi `.env.local`, isi:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

NEXT_PUBLIC_ADMIN_EMAILS=ika.indriyani81@gmail.com,qfazdigital@gmail.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
NEXT_PUBLIC_SITE_URL=https://pawon-mbak-ika.vercel.app
```

> `NEXT_PUBLIC_ADMIN_EMAILS` harus **sama persis** dengan email di `database.rules.json`.
> Yang di env cuma menyembunyikan menu; yang benar-benar mengunci data adalah rules.

Jalankan lokal:

```bash
npm install
npm run dev
```

---

## 5. Upload ke GitHub & deploy Vercel

```bash
git init
git add .
git commit -m "Pawon Mbak Ika"
git branch -M main
git remote add origin https://github.com/USERNAME/pawon-mbak-ika.git
git push -u origin main
```

Lalu di [vercel.com](https://vercel.com) → **Add New → Project** → pilih repo →
tempel semua variabel `.env` di **Environment Variables** → **Deploy**.

Sementara pakai `https://pawon-mbak-ika.vercel.app`. Kalau nanti `pawonmbakika.my.id` sudah aktif:
**Vercel → Settings → Domains → Add**, arahkan DNS-nya sesuai petunjuk Vercel,
lalu ubah `NEXT_PUBLIC_SITE_URL` ke domain baru dan **Redeploy**
(supaya preview Open Graph menunjuk alamat yang benar).

---

## 6. Panel Mbak Ika (`/admin`)

Login pakai email + kata sandi dari langkah 2.3.

**Pesanan** — buku pesanan realtime. Ada rekap hari ini (jumlah pesanan, total porsi, perkiraan uang),
saringan status & tanggal, tombol ubah status, dan tombol WA ke pemesan.
Pesanan baru masuk langsung berbunyi *bel*; tekan "Aktifkan notifikasi" sekali supaya juga muncul notifikasi HP.

**Menu** — tambah/ubah/hapus menu, unggah foto, isi sisa porsi.
Saklar hijau di kanan = buka/tutup menu hari ini. Ada juga **Buka semua / Tutup semua**
untuk ganti menu tiap pagi dengan cepat. Yang ditutup otomatis kena stempel **HABIS** di halaman depan.

**Pengaturan** — semua isi halaman depan diatur dari sini, tidak perlu ubah kode:

- **Logo usaha** → sudah terpasang bawaan dari file logo. Kalau mau ganti, unggah di sini (masuk Cloudinary otomatis).
- **Kode QRIS** → foto/screenshot QRIS milik Mbak Ika + nama pemiliknya.
- Nama usaha, kalimat besar, deskripsi (dipakai juga untuk preview share), alamat, jam buka, batas waktu pesan.
- **Media sosial**: Instagram, Facebook, TikTok, YouTube, Telegram, Threads, X.
  Yang diisi saja yang muncul — tampil di kartu "Ikuti Mbak Ika" dan di footer.
- **Powered by**: nama + link pembuat di footer (default `https://www.qfazdigital.my.id/`).

> Jangan lupa tekan **Simpan pengaturan** setelah unggah gambar.

---

## 7. Logo, favicon, dan ikon aplikasi

Semuanya sudah dibuat dari `logo-pawon-mbak-ika.jpg` dan **jalan otomatis**, tidak perlu diatur lagi:

| File | Dipakai untuk |
|---|---|
| `app/icon.png` | favicon di tab browser & hasil pencarian |
| `app/apple-icon.png` | ikon saat disimpan di layar utama iPhone |
| `public/icons/icon-192.png`, `icon-512.png` | ikon aplikasi Android |
| `public/icons/icon-maskable-512.png` | ikon Android bentuk bulat/kotak-membulat |
| `public/logo.png` | logo di header halaman & gambar preview share |
| `public/logo-asli.jpg` | file asli, arsip |

Emblem bundarnya dipotong mengikuti lingkaran, jadi tulisan "Masakan Tradisional Nusantara"
di bawah logo tidak ikut terpotong setengah waktu jadi ikon kecil.

Kalau nanti logonya diperbarui: unggah versi baru lewat **Pengaturan → Logo usaha**
(itu mengganti logo di halaman depan), lalu kirim file barunya supaya keenam file di atas dibuat ulang.

Menu "Pasang di HP" muncul otomatis di Android/Chrome; di iPhone tombolnya menampilkan
petunjuk **Bagikan → Tambahkan ke Layar Utama**.

---

## 8. Struktur file

```
app/
  page.tsx                 halaman depan (server-rendered, bagus untuk SEO)
  layout.tsx               metadata + Open Graph + font
  manifest.ts              manifest PWA (ikut nama usaha di Pengaturan)
  api/og/route.tsx         gambar preview share, dibuat otomatis
  pesanan/[id]/page.tsx    halaman cek status pesanan
  admin/                   login, buku pesanan, menu, pengaturan
components/
  PapanMenu.tsx            papan menu + keranjang + checkout
  PesanKhusus.tsx          pesanan di luar daftar menu
  Struk.tsx                struk berkode + tombol kirim ke WA
  FormPemesan.tsx          nama, WA, tanggal, cara bayar, catatan
  Medsos.tsx  Bagikan.tsx  WaMelayang.tsx  TombolPasang.tsx
lib/
  order.ts                 pembuatan kode pesanan (transaction) & simpan
  server-data.ts           baca settings/menu via REST untuk SSR
  utils.ts                 rupiah, tanggal, link WA, upload Cloudinary
database.rules.json        security rules Realtime Database
public/sw.js               service worker (halaman selalu ambil versi terbaru)
```

---

## 9. Catatan & rencana lanjutan

- Halaman depan sengaja `force-dynamic` supaya menu yang baru diubah langsung terlihat, tidak kena cache.
- Stok **tidak** dikurangi otomatis saat ada pesanan — supaya `menu` tetap hanya bisa ditulis admin.
  Kalau nanti mau otomatis, jalurnya lewat Cloud Function.
- Kalau nanti ada yang iseng kirim pesanan palsu, langkah berikutnya pasang **Firebase App Check** (reCAPTCHA) — struktur kodenya sudah siap.
- Ide lanjutan: rekap penjualan per minggu, cetak label nasi kotak, daftar pelanggan langganan.
