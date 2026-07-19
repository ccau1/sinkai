import { setRequestLocale } from 'next-intl/server';
import { fetchGalleryMedia } from '@/lib/cms';
import GalleryContent from './GalleryContent';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sections = await fetchGalleryMedia(locale as import('@/i18n/config').Locale);
  return <GalleryContent sections={sections} />;
}
