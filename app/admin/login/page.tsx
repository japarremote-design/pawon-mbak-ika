'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuthKlien, isAdminEmail } from '@/lib/firebase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sandi, setSandi] = useState('');
  const [galat, setGalat] = useState('');
  const [proses, setProses] = useState(false);

  const masuk = async () => {
    setGalat('');
    if (!isAdminEmail(email)) {
      setGalat('Email ini belum terdaftar sebagai pengelola.');
      return;
    }
    setProses(true);
    try {
      await signInWithEmailAndPassword(getAuthKlien(), email.trim(), sandi);
      router.replace('/admin');
    } catch {
      setGalat('Email atau kata sandi salah.');
    } finally {
      setProses(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4">
      <h1 className="font-display text-3xl font-extrabold">Panel Mbak Ika</h1>
      <p className="mt-1 text-sm text-ink/70">
        Masuk untuk mengatur menu hari ini dan melihat pesanan masuk.
      </p>

      <div className="kartu mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="sandi">
            Kata sandi
          </label>
          <input
            id="sandi"
            type="password"
            className="input"
            value={sandi}
            autoComplete="current-password"
            onChange={(e) => setSandi(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && masuk()}
          />
        </div>
        {galat && <p className="text-sm font-semibold text-sambal">{galat}</p>}
        <button onClick={masuk} disabled={proses} className="btn-utama w-full disabled:opacity-60">
          {proses ? 'Memeriksa…' : 'Masuk'}
        </button>
      </div>
    </main>
  );
}
