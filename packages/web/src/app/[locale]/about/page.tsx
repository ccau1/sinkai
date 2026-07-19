import { setRequestLocale } from 'next-intl/server';
import { fetchPageBySlug } from '@/lib/cms';
import { type Locale } from '@/i18n/config';
import CMSPageContent from '@/components/CMSPageContent';
import AboutContent from './AboutContent';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await fetchPageBySlug('about', locale as Locale);
  if (page) {
    return <CMSPageContent page={page} />;
  }

  return <AboutContent />;
}
