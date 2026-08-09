'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { getAuthKlien } from '@/lib/firebase';
import { useAdmin } from '@/lib/useAdmin';

const MENU = [
  { href: '/admin', label: 'Pesanan' },
  { href: '/admin/menu', label: 'Menu' },
  { href: '/admin/pengaturan', label: 'Pengaturan' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { siap, admin, user } = useAdmin();
  const halamanLogin = path === '/admin/login';

  useEffect(() => {
    if (siap && !admin && !halamanLogin) router.replace('/admin/login');
  }, [siap, admin, halamanLogin, router]);

  if (halamanLogin) return <>{children}</>;

  if (!siap) return <p className="p-8 text-center text-ink/60">Memeriksa akses…</p>;

  if (!admin) {
    return (
      <div className="p-8 text-center">
        <p className="text-ink/70">
          Akun {user?.email || 'ini'} tidak terdaftar sebagai pengelola.
        </p>
        <button className="btn-garis mt-4" onClick={() => signOut(getAuthKlien())}>
          Keluar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-daun/15 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <nav className="flex gap-1 overflow-x-auto">
            {MENU.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  path === m.href ? 'bg-daun text-paper' : 'text-daun hover:bg-daun/10'
                }`}
              >
                {m.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => signOut(getAuthKlien())}
            className="whitespace-nowrap text-sm font-semibold text-ink/60 hover:text-sambal"
          >
            Keluar
          </button>
        </div>
      </header>
      <div className="mx-auto w-full max-w-4xl px-4 py-6">{children}</div>
    </div>
  );
}
