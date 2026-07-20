'use client';

import React, { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import CmsImage from '@/components/CmsImage';
import RichTextContent from '@/components/RichTextContent';
import type { CMSTestimony } from '@/lib/cms';

interface TestimoniesContentProps {
  testimonies: CMSTestimony[];
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function TestimoniesContent({ testimonies }: TestimoniesContentProps) {
  const t = useTranslations('testimonies');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isClient = useIsClient();

  const openId = isClient ? searchParams?.get('id') : null;

  const activeTestimony = useMemo(() => {
    if (!openId) return null;
    return testimonies.find((t) => String(t.id) === openId) || null;
  }, [openId, testimonies]);

  const openModal = useCallback(
    (id: string | number) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('id', String(id));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('id');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!activeTestimony) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeModal();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeTestimony, closeModal]);

  return (
    <div>
      {/* Header */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main text-center">
          <p className="text-label mb-3" style={{ color: 'var(--color-primary-600)' }}>
            {t('pageLabel')}
          </p>
          <h1 className="text-headline font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {t('pageTitle')}
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            {t('pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Testimonies Grid */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          {testimonies.length === 0 ? (
            <p className="text-center text-body" style={{ color: 'var(--color-text-secondary)' }}>
              {t('noTestimonies')}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonies.map((testimony) => {
                const firstPhoto = testimony.photos?.[0];
                return (
                  <button
                    key={String(testimony.id)}
                    onClick={() => openModal(testimony.id)}
                    className="group text-left"
                  >
                    <article
                      className="rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <CmsImage
                          src={firstPhoto?.url}
                          filename={firstPhoto?.filename}
                          alt={testimony.name}
                          fill
                          size="thumb"
                          transformFit="cover"
                          transformFormat="auto"
                          transformQuality={85}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {testimony.highlighted && (
                          <span
                            className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: 'var(--color-primary-600)',
                              color: 'var(--color-text-on-primary)',
                            }}
                          >
                            {t('highlighted')}
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h2
                          className="font-semibold text-base mb-1 transition-colors duration-200"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {testimony.name}
                        </h2>
                        {testimony.role && (
                          <p className="text-label mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                            {testimony.role}
                          </p>
                        )}
                        <p
                          className="text-body-sm line-clamp-3 flex-1"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {testimony.synopsis}
                        </p>
                        <span
                          className="inline-flex items-center gap-1 mt-4 text-sm font-semibold"
                          style={{ color: 'var(--color-primary-600)' }}
                        >
                          {t('readMore')} →
                        </span>
                      </div>
                    </article>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {activeTestimony && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          style={{ backgroundColor: 'var(--color-overlay)' }}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={activeTestimony.name}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ backgroundColor: 'var(--color-bg-base)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                color: 'var(--color-text-secondary)',
              }}
              aria-label={t('close')}
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Photos */}
              <div className="relative aspect-square md:aspect-auto md:min-h-[400px]" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                {activeTestimony.photos && activeTestimony.photos.length > 0 ? (
                  <CmsImage
                    src={activeTestimony.photos[0]?.url}
                    alt={activeTestimony.name}
                    fill
                    size="lg"
                    transformFit="cover"
                    transformFormat="auto"
                    transformQuality={85}
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--color-text-tertiary)' }}>
                    {t('noPhoto')}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 lg:p-10">
                <p className="text-label mb-2" style={{ color: 'var(--color-primary-600)' }}>
                  {t('pageLabel')}
                </p>
                <h2
                  className="text-headline font-bold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {activeTestimony.name}
                </h2>
                {activeTestimony.role && (
                  <p className="text-body mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
                    {activeTestimony.role}
                  </p>
                )}
                <blockquote
                  className="text-body-lg italic mb-6 pl-4 border-l-4"
                  style={{
                    color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-primary-400)',
                  }}
                >
                  {activeTestimony.synopsis}
                </blockquote>
                {Boolean(activeTestimony.content) && (
                  <div className="prose-blog">
                    <RichTextContent content={activeTestimony.content} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
