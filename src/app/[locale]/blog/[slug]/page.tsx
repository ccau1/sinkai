import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getPostBySlug, getRelatedPosts, blogPosts } from '@/data/blog';
import { locales, type Locale } from '@/i18n/config';
import BlogPostContent from './BlogPostContent';

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const post of blogPosts) {
      params.push({ locale, slug: post.slug });
    }
  }
  return params;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(slug);
  if (!post) notFound();

  const translation = post.translations[locale as Locale] || post.translations['en'];
  const relatedPosts = getRelatedPosts(slug, 3);

  return (
    <BlogPostContent
      post={post}
      translation={translation}
      relatedPosts={relatedPosts}
      locale={locale}
    />
  );
}
