import type { Settings } from '@/lib/types';

const DAFTAR: { k: keyof Settings; nama: string }[] = [
  { k: 'instagram', nama: 'Instagram' },
  { k: 'facebook', nama: 'Facebook' },
  { k: 'tiktok', nama: 'TikTok' },
  { k: 'youtube', nama: 'YouTube' },
  { k: 'telegram', nama: 'Telegram' },
  { k: 'threads', nama: 'Threads' },
  { k: 'x', nama: 'X' },
];

export default function Medsos({
  settings,
  gaya = 'terang',
}: {
  settings: Settings;
  gaya?: 'terang' | 'gelap';
}) {
  const ada = DAFTAR.filter((d) => (settings[d.k] as string | undefined)?.trim());
  if (!ada.length) return null;

  const kelas =
    gaya === 'gelap'
      ? 'rounded-full border border-paper/30 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-paper hover:text-daun'
      : 'rounded-full border border-daun/25 px-4 py-2 text-sm font-semibold text-daun transition hover:bg-daun hover:text-paper';

  return (
    <div className="flex flex-wrap gap-2">
      {ada.map((d) => (
        <a
          key={d.k}
          href={settings[d.k] as string}
          target="_blank"
          rel="noopener noreferrer"
          className={kelas}
        >
          {d.nama}
        </a>
      ))}
    </div>
  );
}
