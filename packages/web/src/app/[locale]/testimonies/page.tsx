import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { fetchTestimonies } from '@/lib/cms';
import { type Locale } from '@/i18n/config';
import TestimoniesContent from './TestimoniesContent';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const testimonies = await fetchTestimonies(locale as Locale);

  return (
    <Suspense>
      <TestimoniesContent testimonies={testimonies} />
    </Suspense>
  );
}
