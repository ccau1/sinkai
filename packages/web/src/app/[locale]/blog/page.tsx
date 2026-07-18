import { setRequestLocale } from 'next-intl/server';
import { fetchBlogs } from '@/lib/cms';
import { locales, type Locale } from '@/i18n/config';
import BlogContent from './BlogContent';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // During static export, fetch at build time. In dev, fetch on request.
  const posts = await fetchBlogs(locale as Locale);

  return <BlogContent posts={posts} />;
}
