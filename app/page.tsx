import Image from 'next/image';
import { getMenu, getSettings } from '@/lib/server-data';
import { tanggalLayan, tanggalPanjang, waLink } from '@/lib/utils';
import PapanMenu from '@/components/PapanMenu';
import PesanKhusus from '@/components/PesanKhusus';
import WaMelayang from '@/components/WaMelayang';
import Bagikan from '@/components/Bagikan';
import TombolPasang from '@/components/TombolPasang';
import Medsos from '@/components/Medsos';

export const dynamic = 'force-dynamic';

export default async function Beranda() {
  const [settings, menu] = await Promise.all([getSettings(), getMenu()]);
  const layan = tanggalLayan(settings.jamGantiMenu);

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

      {/* KEPALA RAMPING — pelanggan langsung ketemu papan menu di bawahnya */}
      <header className="bg-daun text-paper">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {settings.logoUrl ? (
              <span className="relative shrink-0">
                <Image
                  src={settings.logoUrl}
                  alt={settings.namaUsaha}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-xl bg-white object-contain p-0.5"
                  unoptimized
                />
                <span
                  aria-hidden
                  className="absolute -top-2 left-1/2 h-3 w-1.5 -translate-x-1/2 rounded-full bg-paper/70 animate-uap"
                />
              </span>
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-paper/10 text-xl">
                🍲
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-base font-extrabold leading-tight sm:text-lg">
                {settings.namaUsaha}
              </p>
              <p className="truncate text-[11px] uppercase tracking-[0.2em] text-kunyit">
                Masakan tradisional Nusantara · sejak 2010
              </p>
            </div>
          </div>
          <TombolPasang kelas="btn shrink-0 border-2 border-paper/40 px-3 py-2 text-xs text-paper hover:bg-paper hover:text-daun" />
        </div>
      </header>

      <PapanMenu menuAwal={menu} settings={settings} />

      {/* TENTANG & INFO — turun ke bawah papan menu */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-12">
        <div className="papan p-6 sm:p-8">
          <h1 className="font-display text-3xl font-extrabold leading-[1.05] sm:text-5xl">
            {settings.tagline}
          </h1>
          <p className="mt-3 max-w-xl text-paper/80">{settings.deskripsi}</p>

          <a
            href={waLink(settings.wa, `Assalamualaikum wr. wb. Halo ${settings.namaUsaha}, saya mau pesan.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-6 border-2 border-paper/40 text-paper hover:bg-paper hover:text-daun"
          >
            Tanya lewat WhatsApp
          </a>

          <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: 'Jam buka', d: settings.jamBuka || 'Hubungi lewat WA' },
              { t: 'Pembayaran', d: 'Tunai atau QRIS' },
              {
                t: 'Cara terima',
                d: settings.wilayahAntar
                  ? `Diambil sendiri atau dikirim kurir (${settings.wilayahAntar})`
                  : 'Diambil sendiri atau dikirim kurir',
              },
              { t: 'Menu besok dibuka', d: `Mulai jam ${settings.jamGantiMenu || '13:00'} WIB` },
              { t: 'Batas pesan', d: settings.batasPesan || 'Selama porsi masih ada' },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl bg-paper/10 p-4">
                <dt className="text-xs uppercase tracking-widest text-kunyit">{x.t}</dt>
                <dd className="mt-1 text-sm">{x.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

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
            Landing Page {settings.namaUsaha.toUpperCase()} by{' '}
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
