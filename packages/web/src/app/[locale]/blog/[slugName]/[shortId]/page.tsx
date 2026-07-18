import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { fetchBlogBySlug, fetchBlogs, getBlogSlugName } from '@/lib/cms';
import { locales, type Locale } from '@/i18n/config';
import BlogPostContent from './BlogPostContent';

export async function generateStaticParams() {
  const params: { locale: string; slugName: string; shortId: string }[] = [];
  for (const locale of locales) {
    const posts = await fetchBlogs(locale as Locale);
    for (const post of posts) {
      params.push({ locale, slugName: getBlogSlugName(post, locale as Locale), shortId: post.shortId });
    }
  }
  return params;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slugName: string; shortId: string }>;
}) {
  const { locale, slugName, shortId } = await params;
  setRequestLocale(locale);

  const post = await fetchBlogBySlug(slugName, shortId, locale as Locale);
  if (!post) notFound();

  return <BlogPostContent post={post} locale={locale} />;
}
