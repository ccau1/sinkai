import { setRequestLocale } from 'next-intl/server';
import { fetchPageBySlug, fetchFormByTitle } from '@/lib/cms';
import { type Locale } from '@/i18n/config';
import CMSPageContent from '@/components/CMSPageContent';
import ContactContent from './ContactContent';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, contactForm] = await Promise.all([
    fetchPageBySlug('contact', locale as Locale),
    fetchFormByTitle('Contact', locale as Locale),
  ]);

  if (page) {
    return <CMSPageContent page={page} />;
  }

  return <ContactContent form={contactForm} />;
}
