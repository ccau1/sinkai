'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CmsImage from '@/components/CmsImage';
import type { CMSGallerySection, GalleryCategory } from '@/lib/cms';
import { getMediaAlt } from '@/lib/cms';

gsap.registerPlugin(ScrollTrigger);

interface GalleryContentProps {
  sections: CMSGallerySection[];
}

function toCamelCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

function categoryToKeys(category: GalleryCategory) {
  const id = toCamelCase(category)
  switch (category) {
    case 'news':
      return { labelKey: 'newsLabel', titleKey: 'newsTitle', descKey: 'newsDesc' as const };
    case 'others':
      return { labelKey: 'othersLabel' as const, titleKey: 'othersTitle' as const, descKey: undefined };
    default:
      return {
        labelKey: `${id}En` as const,
        titleKey: `${id}Title` as const,
        descKey: `${id}Desc` as const,
      };
  }
}

export default function GalleryContent({ sections }: GalleryContentProps) {
  const t = useTranslations('gallery');
  const locale = useLocale();
  const [lightbox, setLightbox] = useState<{ images: CMSGallerySection['images']; index: number } | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!pageRef.current) return;
      gsap.fromTo(
        pageRef.current.querySelectorAll('.reveal'),
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.03,
          scrollTrigger: { trigger: pageRef.current, start: 'top 85%' },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = 'hidden';
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setLightbox(null);
        if (e.key === 'ArrowLeft') setLightbox(prev => prev ? { ...prev, index: Math.max(0, prev.index - 1) } : null);
        if (e.key === 'ArrowRight') setLightbox(prev => prev ? { ...prev, index: Math.min(prev.images.length - 1, prev.index + 1) } : null);
      };
      document.addEventListener('keydown', handler);
      return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
    }
  }, [lightbox]);

  return (
    <div ref={pageRef}>
      {/* Title */}
      <section className="section text-center" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main">
          <h1 className="reveal text-headline font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {t('pageTitle')}
          </h1>
          <p className="reveal text-body-lg max-w-3xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            {t('pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Gallery Sections */}
      {sections.map((section, idx) => {
        const { labelKey, titleKey, descKey } = categoryToKeys(section.category);
        return (
          <section key={section.category} className="py-12"
            style={{
              backgroundColor: idx % 2 === 0 ? 'var(--color-bg-base)' : 'var(--color-bg-surface)',
              borderBottom: '1px solid var(--color-border)',
            }}>
            <div className="container-main">
              <div className="mb-6">
                <p className="reveal text-label mb-2" style={{ color: 'var(--color-primary-600)' }}>
                  {t(labelKey)}
                </p>
                <h2 className="reveal text-title font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {t(titleKey)}
                </h2>
                {descKey && (
                  <p className="reveal text-body-sm max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
                    {t(descKey)}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {section.images.map((image, i) => (
                  <div key={image.id} className="reveal aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setLightbox({ images: section.images, index: i })}>
                    <CmsImage
                      src={image.url}
                      filename={image.filename}
                      alt={getMediaAlt(image, locale)}
                      size="thumb"
                      transformFit="cover"
                      transformFormat="auto"
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Volunteer Quotes */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-inverted)' }}>
        <div className="container-main">
          <p className="reveal text-label mb-3" style={{ color: 'var(--color-primary-400)' }}>
            {t('volunteerLabel')}
          </p>
          <h2 className="reveal text-title font-bold mb-10" style={{ color: 'var(--color-text-inverted)' }}>
            {t('volunteerTitle')}
          </h2>
          <div className="max-w-3xl">
            <div className="reveal mb-10">
              <span className="text-5xl block mb-3" style={{ color: 'var(--color-primary-500)', opacity: 0.5, lineHeight: 1 }}>&quot;</span>
              <p className="text-body-lg italic mb-4" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
                {t('quote1')}
              </p>
              <p className="text-label" style={{ color: 'var(--color-primary-400)' }}>{t('author1')}</p>
            </div>
            <div className="reveal pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-5xl block mb-3" style={{ color: 'var(--color-primary-500)', opacity: 0.5, lineHeight: 1 }}>&quot;</span>
              <p className="text-body-lg italic mb-4" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
                {t('quote2')}
              </p>
              <p className="text-label" style={{ color: 'var(--color-primary-400)' }}>{t('author2')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white p-2 z-10" onClick={() => setLightbox(null)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          {lightbox.index > 0 && (
            <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 z-10"
              onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: lightbox.index - 1 }); }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {lightbox.index < lightbox.images.length - 1 && (
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 z-10"
              onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: lightbox.index + 1 }); }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
          <CmsImage
            key={`lightbox-${lightbox.index}`}
            src={lightbox.images[lightbox.index].url}
            alt={getMediaAlt(lightbox.images[lightbox.index], locale)}
            size="full"
            transformFormat="auto"
            width={1200}
            height={800}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs font-medium tracking-wider">
            {lightbox.index + 1} / {lightbox.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
