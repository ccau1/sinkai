import { setRequestLocale } from 'next-intl/server';
import { fetchInstallations, fetchInstallationTypes } from '@/lib/cms';
import { type Locale } from '@/i18n/config';
import InstallationsContent from './InstallationsContent';

export default async function InstallationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const types = await fetchInstallationTypes(locale as Locale);
  const groups = await Promise.all(
    types.map(async (type) => ({
      type,
      items: await fetchInstallations(locale as Locale, type.id),
    }))
  );

  return <InstallationsContent groups={groups} />;
}
