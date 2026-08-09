'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getAuthKlien, isAdminEmail } from './firebase';

export function useAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(getAuthKlien(), (u) => {
      setUser(u);
      setSiap(true);
    });
  }, []);

  return { user, siap, admin: siap && isAdminEmail(user?.email) };
}
