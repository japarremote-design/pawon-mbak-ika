'use client';

import Image from 'next/image';
import { isoHariIni, tanggalPanjang } from '@/lib/utils';
import type { Pengiriman, Settings } from '@/lib/types';

export type DataPemesan = {
  nama: string;
  wa: string;
  tanggalAmbil: string;
  jamAmbil: string;
  pengiriman: Pengiriman;
  alamat: string;
  metodeBayar: 'tunai' | 'qris';
  catatan: string;
};

export function pemesanAwal(tanggal?: string): DataPemesan {
  return {
    nama: '',
    wa: '',
    tanggalAmbil: tanggal || isoHariIni(),
    jamAmbil: '',
    pengiriman: 'ambil',
    alamat: '',
    metodeBayar: 'tunai',
    catatan: '',
  };
}

export default function FormPemesan({
  nilai,
  ubah,
  settings,
  tanggalLayanan,
}: {
  nilai: DataPemesan;
  ubah: (n: DataPemesan) => void;
  settings: Settings;
  /** Tanggal yang sedang dilayani papan menu — jadi acuan tanggal terawal. */
  tanggalLayanan?: string;
}) {
  const set = <K extends keyof DataPemesan>(k: K, v: DataPemesan[K]) => ubah({ ...nilai, [k]: v });
  const kurir = nilai.pengiriman === 'kurir';
  const minTanggal = tanggalLayanan || isoHariIni();

  return (
    <div className="space-y-4">
      <div>
        <label className="label" htmlFor="nama">
          Nama pemesan
        </label>
        <input
          id="nama"
          className="input"
          value={nilai.nama}
          onChange={(e) => set('nama', e.target.value)}
          placeholder="Nama yang dipanggil Mbak Ika"
          autoComplete="name"
        />
      </div>

      <div>
        <label className="label" htmlFor="wa">
          Nomor WhatsApp
        </label>
        <input
          id="wa"
          className="input"
          inputMode="tel"
          value={nilai.wa}
          onChange={(e) => set('wa', e.target.value)}
          placeholder="0812xxxxxxx"
          autoComplete="tel"
        />
      </div>

      {/* cara terima pesanan */}
      <div>
        <span className="label">Cara terima pesanan</span>
        <div className="grid grid-cols-2 gap-3">
          {([
            { k: 'ambil', judul: 'Diambil sendiri', ket: 'Datang ke pawon' },
            { k: 'kurir', judul: 'Dikirim kurir', ket: 'Diantar ke alamat' },
          ] as const).map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => set('pengiriman', o.k)}
              aria-pressed={nilai.pengiriman === o.k}
              className={`rounded-xl border-2 px-3 py-3 text-left transition ${
                nilai.pengiriman === o.k
                  ? 'border-daun bg-daun text-paper'
                  : 'border-daun/25 bg-white text-daun'
              }`}
            >
              <span className="block font-semibold leading-tight">{o.judul}</span>
              <span className="mt-0.5 block text-xs opacity-75">{o.ket}</span>
            </button>
          ))}
        </div>
      </div>

      {kurir && (
        <div>
          <label className="label" htmlFor="alamat">
            Alamat pengiriman
          </label>
          <textarea
            id="alamat"
            className="input min-h-[90px]"
            value={nilai.alamat}
            onChange={(e) => set('alamat', e.target.value)}
            placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan (contoh: sebelah toko bangunan)"
            autoComplete="street-address"
          />
          <p className="mt-1 text-xs text-ink/60">
            Tulis patokannya juga ya, biar kurir tidak muter-muter.
            {settings.ongkir ? ` ${settings.ongkir}.` : ''}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="tgl">
            Tanggal {kurir ? 'kirim' : 'ambil'}
          </label>
          <input
            id="tgl"
            type="date"
            className="input"
            min={minTanggal}
            value={nilai.tanggalAmbil}
            onChange={(e) => set('tanggalAmbil', e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="jam">
            Jam <span className="font-normal text-ink/50">(opsional)</span>
          </label>
          <input
            id="jam"
            type="time"
            className="input"
            value={nilai.jamAmbil}
            onChange={(e) => set('jamAmbil', e.target.value)}
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-ink/60">Untuk {tanggalPanjang(nilai.tanggalAmbil)}</p>

      <div>
        <span className="label">Cara bayar</span>
        <div className="grid grid-cols-2 gap-3">
          {(['tunai', 'qris'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set('metodeBayar', m)}
              aria-pressed={nilai.metodeBayar === m}
              className={`rounded-xl border-2 px-4 py-3 font-semibold transition ${
                nilai.metodeBayar === m
                  ? 'border-daun bg-daun text-paper'
                  : 'border-daun/25 bg-white text-daun'
              }`}
            >
              {m === 'tunai' ? 'Tunai' : 'QRIS'}
            </button>
          ))}
        </div>
        {nilai.metodeBayar === 'qris' && (
          <div className="mt-3 rounded-xl border border-daun/20 bg-white p-3">
            {settings.qrisUrl ? (
              <>
                <Image
                  src={settings.qrisUrl}
                  alt="Kode QRIS Pawon Mbak Ika"
                  width={520}
                  height={640}
                  className="mx-auto h-auto w-full max-w-[260px] rounded-lg"
                  unoptimized
                />
                <p className="mt-2 text-center text-xs text-ink/70">
                  Scan pakai aplikasi bank / e-wallet apa saja. Atas nama{' '}
                  <b>{settings.qrisNama || settings.namaUsaha}</b>. Kirim bukti transfer lewat WA ya.
                </p>
              </>
            ) : (
              <p className="text-center text-sm text-ink/70">
                Kode QRIS dikirim lewat WhatsApp setelah pesanan masuk.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="catatan">
          Catatan <span className="font-normal text-ink/50">(opsional)</span>
        </label>
        <textarea
          id="catatan"
          className="input min-h-[80px]"
          value={nilai.catatan}
          onChange={(e) => set('catatan', e.target.value)}
          placeholder="Tidak pedas, nasi dipisah, sambal dipisah..."
        />
      </div>
    </div>
  );
}
