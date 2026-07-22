import { setRequestLocale } from 'next-intl/server';
import { fetchPageBySlug } from '@/lib/cms';
import { type Locale } from '@/i18n/config';
import DonateContent from '../donate/DonateContent';
import { PuckRenderer } from '@/puck/PuckRenderer';
import type { Data } from '@puckeditor/core';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await fetchPageBySlug('donate-2', locale as Locale);
  const puckData = page?.puckData;

  if (puckData && typeof puckData === 'object' && 'root' in puckData) {
    return <PuckRenderer data={puckData as Data} />;
  }

  return <DonateContent />;
}
