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
| kolom `pengiriman` & `alamat` | ikut aturan pesanan | `pengiriman` wajib `ambil` atau `kurir`, alamat maksimal 400 huruf |
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
Ada tombol **Salin link untuk dibagikan**: link-nya diberi penanda tanggal (`/?m=20260809`)
supaya WhatsApp memuat ulang pratinjau tiap menu berganti, bukan memakai simpanan kemarin.
Saklar hijau di kanan = buka/tutup menu hari ini. Ada juga **Buka semua / Tutup semua**
untuk ganti menu tiap pagi dengan cepat. Yang ditutup otomatis kena stempel **HABIS** di halaman depan.

**Pengaturan** — semua isi halaman depan diatur dari sini, tidak perlu ubah kode:

- **Logo usaha** → sudah terpasang bawaan dari file logo. Kalau mau ganti, unggah di sini (masuk Cloudinary otomatis).
- **Kode QRIS** → foto/screenshot QRIS milik Mbak Ika + nama pemiliknya.
- Nama usaha, kalimat besar, deskripsi (dipakai juga untuk preview share), alamat, jam buka, batas waktu pesan.
- **Jam papan menu pindah ke besok** (bawaan 13:00) — lihat bagian 6a.
- **Keterangan ongkir** dan **wilayah yang dilayani kurir**.
- **Media sosial**: Instagram, Facebook, TikTok, YouTube, Telegram, Threads, X.
  Yang diisi saja yang muncul — tampil di kartu "Ikuti Mbak Ika" dan di footer.
- **Powered by**: nama + link pembuat di footer (default `https://www.qfazdigital.my.id/`).

> Jangan lupa tekan **Simpan pengaturan** setelah unggah gambar.

---

## 6a. Jam pindah papan menu (menu besok)

Papan menu punya **tanggal layanan**, bukan sekadar "hari ini". Aturannya satu angka:
**Jam papan menu pindah ke besok** di Pengaturan (bawaan `13:00` WIB).

- Sebelum jam 13.00 tanggal 9 Agustus → papan menampilkan **menu hari ini (9 Agustus)**.
- Mulai jam 13.00 tanggal 9 Agustus → papan berpindah ke **menu besok (10 Agustus)**,
  judulnya berubah jadi "Masakan besok", tanggal di form pesanan otomatis 10 Agustus,
  dan pratinjau share ikut menulis **MENU BESOK**.

Jadi alurnya: siang hari Mbak Ika buka panel Menu, tutup menu yang sudah habis,
buka menu untuk besok — dan sejak jam itu semua pesanan yang masuk terhitung untuk besok.

**Dashboard ikut berpindah.** Sebelum jam 13.00 kotak rekap tertulis "Pesanan hari ini";
lewat jam itu berubah jadi **"Pesanan besok"** beserta tanggalnya, karena sejak jam itu
yang perlu dihitung Mbak Ika adalah masakan besok. Ada tombol saring **"Hanya besok"**
untuk melihat pesanan tanggal itu saja.

Waktu dihitung dalam **WIB** baik di HP pemesan maupun di server Vercel (yang memakai UTC),
jadi tidak akan meleset 7 jam.

---

## 6c. Diambil sendiri atau dikirim kurir

Di form Data Pesanan ada pilihan **Diambil sendiri** / **Dikirim kurir**.
Kalau dipilih kurir, kolom **Alamat pengiriman** muncul dan wajib diisi minimal 10 huruf —
pesanan tidak bisa disimpan kalau alamatnya kosong.

Alamat ikut ke mana-mana: tercatat di database, tercetak di struk, ikut terkirim di teks
WhatsApp, dan tampil di kartu pesanan pada panel admin dengan penanda oranye **KURIR**.
Di rekap dashboard ada kotak **"Dikirim kurir"** supaya Mbak Ika tahu berapa yang harus diantar.

Keterangan ongkir dan wilayah antar diisi di Pengaturan, muncul otomatis saat pemesan
memilih dikirim.

---

## 6b. Pratinjau saat link dibagikan

Gambar pratinjau (Open Graph) **dibuat otomatis dari menu yang sedang dibuka** — foto tiap menu
disusun jadi kisi dengan label nama + harga, ditambah kepala berisi logo, tanggal, dan jumlah
"menu ready". Kalau tidak ada menu yang dibuka, yang tampil kartu bermerek biasa.

Judul dan teks pratinjau juga ikut: "Pawon Mbak Ika — 8 menu ready hari ini" dan daftar menunya.

Alamat gambarnya `/api/og?v=<sidik-menu>`; sidik itu berubah tiap menu, harga, atau fotonya
berubah, jadi WhatsApp dan Facebook tahu harus mengambil gambar baru.

Catatan penting: WhatsApp menyimpan pratinjau **per alamat link**. Kalau alamat yang dibagikan
sama persis dengan yang kemarin, kadang WA masih menampilkan gambar lama beberapa jam.
Karena itu pakai tombol **Salin link untuk dibagikan** di panel Menu — link-nya otomatis diberi
penanda tanggal. Untuk Facebook, pratinjau bisa dipaksa segar lewat
[Sharing Debugger](https://developers.facebook.com/tools/debug/).

Foto menu sebaiknya mendatar (landscape) dan terang — di kisi pratinjau fotonya dipotong
mengikuti kotak, jadi letakkan makanannya di tengah bingkai.

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
