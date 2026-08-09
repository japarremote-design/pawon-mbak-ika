'use client';

import { useState } from 'react';
import { buatPesanan } from '@/lib/order';
import type { Order, Settings } from '@/lib/types';
import FormPemesan, { pemesanKosong, type DataPemesan } from './FormPemesan';
import Struk from './Struk';

export default function PesanKhusus({ settings }: { settings: Settings }) {
  const [buka, setBuka] = useState(false);
  const [permintaan, setPermintaan] = useState('');
  const [porsi, setPorsi] = useState(10);
  const [pemesan, setPemesan] = useState<DataPemesan>(pemesanKosong);
  const [kirim, setKirim] = useState(false);
  const [galat, setGalat] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  const simpan = async () => {
    setGalat('');
    if (!permintaan.trim()) return setGalat('Tulis dulu masakan yang diinginkan.');
    if (!pemesan.nama.trim()) return setGalat('Isi nama dulu ya.');
    if (pemesan.wa.replace(/\D/g, '').length < 9) return setGalat('Nomor WhatsApp belum benar.');
    setKirim(true);
    try {
      const hasil = await buatPesanan({
        tipe: 'custom',
        nama: pemesan.nama,
        wa: pemesan.wa,
        items: [],
        permintaan,
        jumlahPorsi: porsi,
        tanggalAmbil: pemesan.tanggalAmbil,
        jamAmbil: pemesan.jamAmbil,
        metodeBayar: pemesan.metodeBayar,
        catatan: pemesan.catatan,
      });
      setOrder(hasil);
      setBuka(false);
      setPermintaan('');
      setPemesan(pemesanKosong);
    } catch (e: any) {
      setGalat(e?.message || 'Pesanan gagal disimpan. Coba lagi sebentar.');
    } finally {
      setKirim(false);
    }
  };

  return (
    <section id="pesanan-khusus" className="mx-auto w-full max-w-5xl px-4 pb-10">
      <div className="kartu border-2 border-dashed border-daun/40 bg-kertas p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-daunmuda">Di luar daftar menu</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
          Pesan masakan lain untuk tanggal tertentu
        </h2>
        <p className="mt-2 max-w-2xl text-ink/75">
          Arisan, pengajian, rapat kantor, atau cuma pengin lauk yang tidak ada di papan hari ini —
          tulis maunya, tanggalnya, dan jumlah porsinya. Mbak Ika balas dengan harga dan
          ketersediaannya lewat WhatsApp.
        </p>

        {!buka ? (
          <button onClick={() => setBuka(true)} className="btn-garis mt-5">
            Tulis pesanan khusus
          </button>
        ) : (
          <div className="mt-6 max-w-md space-y-4">
            <div>
              <label className="label" htmlFor="permintaan">
                Masakan yang diinginkan
              </label>
              <textarea
                id="permintaan"
                className="input min-h-[110px]"
                value={permintaan}
                onChange={(e) => setPermintaan(e.target.value)}
                placeholder="Contoh: nasi kotak isi ayam bakar, urap, tempe orek, kerupuk"
              />
            </div>
            <div>
              <label className="label" htmlFor="porsi">
                Jumlah porsi
              </label>
              <input
                id="porsi"
                type="number"
                min={1}
                className="input"
                value={porsi}
                onChange={(e) => setPorsi(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <FormPemesan nilai={pemesan} ubah={setPemesan} settings={settings} />

            {galat && <p className="text-sm font-semibold text-sambal">{galat}</p>}

            <div className="flex gap-3">
              <button onClick={simpan} disabled={kirim} className="btn-utama flex-1 disabled:opacity-60">
                {kirim ? 'Menyimpan…' : 'Simpan & kirim ke WA'}
              </button>
              <button onClick={() => setBuka(false)} className="btn text-ink/60">
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {order && <Struk order={order} settings={settings} onTutup={() => setOrder(null)} />}
    </section>
  );
}
