import { setRequestLocale } from 'next-intl/server';
import { fetchPageBySlug, fetchFormByTitle } from '@/lib/cms';
import { type Locale } from '@/i18n/config';
import CMSPageContent from '@/components/CMSPageContent';
import DonateContent from './DonateContent';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, donationForm] = await Promise.all([
    fetchPageBySlug('donate', locale as Locale),
    fetchFormByTitle('Donation', locale as Locale),
  ]);

  if (page) {
    return <CMSPageContent page={page} />;
  }

  return <DonateContent donationForm={donationForm} />;
}
