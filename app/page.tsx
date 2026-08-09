import Image from 'next/image';
import { getMenu, getSettings } from '@/lib/server-data';
import { tanggalPanjang, waLink } from '@/lib/utils';
import PapanMenu from '@/components/PapanMenu';
import PesanKhusus from '@/components/PesanKhusus';
import WaMelayang from '@/components/WaMelayang';
import Bagikan from '@/components/Bagikan';
import TombolPasang from '@/components/TombolPasang';
import Medsos from '@/components/Medsos';

export const dynamic = 'force-dynamic';

export default async function Beranda() {
  const [settings, menu] = await Promise.all([getSettings(), getMenu()]);
  const siap = menu.filter((m) => m.aktif && (m.stok == null || m.stok > 0)).length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: settings.namaUsaha,
    description: settings.deskripsi,
    image: settings.logoUrl || undefined,
    telephone: '+' + settings.wa,
    servesCuisine: 'Masakan rumahan Indonesia',
    address: settings.alamat ? { '@type': 'PostalAddress', streetAddress: settings.alamat } : undefined,
    openingHours: settings.jamBuka || undefined,
    paymentAccepted: 'Tunai, QRIS',
  };

  return (
    <main className="pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <header className="relative overflow-hidden bg-daun text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-kunyit/20 blur-3xl"
        />
        <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-8 sm:pt-12">
          <nav className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <span className="relative">
                  <Image
                    src={settings.logoUrl}
                    alt={settings.namaUsaha}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-2xl bg-white object-contain p-1"
                    unoptimized
                  />
                  <span
                    aria-hidden
                    className="absolute -top-2 left-1/2 h-4 w-1.5 -translate-x-1/2 rounded-full bg-paper/70 animate-uap"
                  />
                </span>
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper/10 text-2xl">
                  🍲
                </span>
              )}
              <span className="font-display text-lg font-extrabold tracking-tight">
                {settings.namaUsaha}
              </span>
            </div>
            <TombolPasang kelas="btn border-2 border-paper/40 px-4 py-2 text-sm text-paper hover:bg-paper hover:text-daun" />
          </nav>

          <p className="mt-10 text-xs uppercase tracking-[0.3em] text-kunyit">
            Masakan tradisional Nusantara · sejak 2010
          </p>
          <p className="mt-1 text-sm text-paper/60">{tanggalPanjang(new Date())}</p>
          <h1 className="mt-3 font-display text-[2.6rem] font-extrabold leading-[1.02] sm:text-6xl">
            {settings.tagline}
          </h1>
          <p className="mt-4 max-w-xl text-paper/80">{settings.deskripsi}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#menu" className="btn-utama">
              {siap > 0 ? `Lihat ${siap} menu hari ini` : 'Lihat papan menu'}
            </a>
            <a
              href={waLink(settings.wa, `Halo ${settings.namaUsaha}, saya mau pesan.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn border-2 border-paper/40 text-paper hover:bg-paper hover:text-daun"
            >
              Tanya lewat WhatsApp
            </a>
          </div>

          <dl className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { t: 'Jam buka', d: settings.jamBuka || 'Hubungi lewat WA' },
              { t: 'Pembayaran', d: 'Tunai atau QRIS' },
              { t: 'Batas pesan', d: settings.batasPesan || 'Selama porsi masih ada' },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl bg-paper/10 p-4">
                <dt className="text-xs uppercase tracking-widest text-kunyit">{x.t}</dt>
                <dd className="mt-1 text-sm">{x.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <PapanMenu menuAwal={menu} settings={settings} />
      <PesanKhusus settings={settings} />

      {/* CARA PESAN */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-12">
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Cara pesan</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-4">
          {[
            ['Pilih menu', 'Ambil dari papan menu hari ini, atau tulis pesanan khusus.'],
            ['Isi data', 'Nama, nomor WA, tanggal ambil, dan cara bayar.'],
            ['Dapat kode', 'Pesanan langsung tercatat dan kamu terima struk berkode.'],
            ['Kirim ke WA', 'Tekan tombolnya, isinya sama persis dengan yang tercatat.'],
          ].map(([judul, isi], i) => (
            <li key={judul} className="kartu">
              <span className="font-struk text-sm text-sambal">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-1 font-display text-lg font-bold">{judul}</h3>
              <p className="mt-1 text-sm text-ink/70">{isi}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-2xl bg-kunyit/25 p-4 text-sm">
          <b>Kenapa harus lewat form?</b> Karena jumlah pesanan tercatat otomatis di database, bukan
          ditulis ulang manual. Jadi kalau kamu pesan 10, yang masuk ke buku pesanan juga 10 —
          lengkap dengan kode pesanan yang bisa dicek dua-duanya.
        </p>
      </section>

      {/* BAYAR + BAGIKAN */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-14">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="kartu">
            <h2 className="font-display text-xl font-extrabold">Pembayaran</h2>
            <p className="mt-2 text-sm text-ink/75">
              Bayar tunai saat ambil, atau scan QRIS. Kalau pakai QRIS, kirim bukti transfernya lewat
              WhatsApp beserta kode pesanan.
            </p>
            {settings.qrisUrl ? (
              <Image
                src={settings.qrisUrl}
                alt={`QRIS ${settings.namaUsaha}`}
                width={520}
                height={640}
                className="mt-4 h-auto w-full max-w-[240px] rounded-xl border border-daun/15 bg-white p-2"
                unoptimized
              />
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-daun/30 p-4 text-sm text-ink/60">
                Kode QRIS belum diunggah. Mbak Ika bisa memasangnya lewat panel Pengaturan.
              </p>
            )}
          </div>

          <div className="papan flex flex-col justify-between p-6">
            <div>
              <h2 className="font-display text-xl font-extrabold">Bagikan ke teman</h2>
              <p className="mt-2 text-sm text-paper/75">
                Kirim link ini ke grup WA, IG, atau Telegram. Yang muncul di preview logo dan menu
                Pawon Mbak Ika.
              </p>
            </div>
            <div className="mt-5 space-y-5">
              <Bagikan judul={settings.namaUsaha} />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-kunyit">Ikuti Mbak Ika</p>
                <div className="mt-2">
                  <Medsos settings={settings} gaya="gelap" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-daun/15 px-4 py-8 text-sm">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-bold">{settings.namaUsaha}</p>
            {settings.alamat && <p className="text-ink/70">{settings.alamat}</p>}
            <p className="text-ink/70">WhatsApp +{settings.wa}</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <Medsos settings={settings} />
            <a className="text-sm font-semibold text-ink/60 hover:text-daun" href="/admin">
              Panel Mbak Ika
            </a>
          </div>
        </div>
        {settings.poweredByUrl && (
          <p className="mx-auto mt-6 w-full max-w-5xl text-xs text-ink/50">
            powered by{' '}
            <a
              className="underline hover:text-daun"
              href={settings.poweredByUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {settings.poweredByNama || settings.poweredByUrl}
            </a>
          </p>
        )}
      </footer>

      <WaMelayang nomor={settings.wa} nama={settings.namaUsaha} />
    </main>
  );
}
