'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { blogPosts } from '@/data/blog';

export default function BlogPage() {
  const locale = useLocale();
  const t = useTranslations('blog');

  return (
    <div>
      {/* Header */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main text-center">
          <p className="text-label mb-3" style={{ color: 'var(--color-primary-600)' }}>
            SIN KAI BLOG
          </p>
          <h1 className="text-headline font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {t('pageTitle')}
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            {t('pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => {
              const translation = post.translations[locale as keyof typeof post.translations] || post.translations['en'];
              return (
                <Link key={post.slug} href={`/${locale}/blog/${post.slug}`} className="group">
                  <article className="rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border)',
                    }}>
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={translation.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <p className="text-label mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        {post.date}
                      </p>
                      <h2 className="font-semibold text-base mb-2 flex-1 transition-colors duration-200"
                        style={{ color: 'var(--color-text-primary)' }}>
                        {translation.title}
                      </h2>
                      <p className="text-body-sm line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {translation.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold"
                        style={{ color: 'var(--color-primary-600)' }}>
                        {t('readMore')} →
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
