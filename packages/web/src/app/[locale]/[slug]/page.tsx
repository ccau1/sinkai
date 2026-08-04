import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { fetchPageBySlug } from '@/lib/cms';
import { type Locale, locales } from '@/i18n/config';
import CMSPageContent from '@/components/CMSPageContent';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const page = await fetchPageBySlug(slug, locale as Locale);
  if (!page) {
    notFound();
  }

  return <CMSPageContent page={page} />;
}
