import type { Metadata } from 'next';
import { getSettings } from '@/lib/server-data';
import StatusPesanan from '@/components/StatusPesanan';

export const metadata: Metadata = {
  title: 'Status pesanan',
  robots: { index: false, follow: false },
};

export default async function HalamanPesanan({ params }: { params: { id: string } }) {
  const settings = await getSettings();
  return <StatusPesanan id={params.id} settings={settings} />;
}
