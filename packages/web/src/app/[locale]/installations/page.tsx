import { setRequestLocale } from 'next-intl/server';
import { fetchInstallations } from '@/lib/cms';
import { type Locale } from '@/i18n/config';
import InstallationsContent from './InstallationsContent';

export default async function InstallationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [schools, bridges, waterTanks] = await Promise.all([
    fetchInstallations(locale as Locale, 'school'),
    fetchInstallations(locale as Locale, 'bridge'),
    fetchInstallations(locale as Locale, 'water-tank'),
  ]);

  return <InstallationsContent schools={schools} bridges={bridges} waterTanks={waterTanks} />;
}
