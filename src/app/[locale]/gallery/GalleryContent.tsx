'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function thumbToOriginal(path: string): string {
  return path.replace('-thumb.jpg', '.jpg');
}

interface GallerySection {
  id: string;
  images: string[];
}

const gallerySections: GallerySection[] = [
  { id: 'snowDisaster', images: ['16_01-thumb.jpg','16_02-thumb.jpg','16_07-thumb.jpg','16_08-thumb.jpg','16_09-thumb.jpg','16_10-thumb.jpg','16_13-thumb.jpg','16_15-thumb.jpg','16_23-thumb.jpg','16_25-thumb.jpg','16_26-thumb.jpg','16_27-thumb.jpg','16_28-thumb.jpg','16_29-thumb.jpg','16_30-thumb.jpg','16_31-thumb.jpg','16_32-thumb.jpg','16_33-thumb.jpg','16_34-thumb.jpg','16_35-thumb.jpg','16_36-thumb.jpg','16_37-thumb.jpg','16_38-thumb.jpg','16_39-thumb.jpg','16_40-thumb.jpg','16_41-thumb.jpg','16_42-thumb.jpg','16_43-thumb.jpg','16_44-thumb.jpg','16_45-thumb.jpg','16_46-thumb.jpg','16_47-thumb.jpg','16_48-thumb.jpg','16_49-thumb.jpg'] },
  { id: 'oldSchools', images: ['06_osch_01-thumb.jpg','06_osch_02-thumb.jpg','06_osch_04-thumb.jpg','06_osch_05-thumb.jpg','06_osch_06-thumb.jpg','06_osch_07-thumb.jpg','06_osch_08-thumb.jpg','06_osch_09-thumb.jpg','06_osch_10-thumb.jpg','06_osch_12-thumb.jpg','06_osch_13-thumb.jpg','06_osch_14-thumb.jpg','06_osch_15-thumb.jpg','06_osch_16-thumb.jpg','06_osch_17-thumb.jpg','06_osch_18-thumb.jpg','06_osch_19-thumb.jpg','06_osch_20-thumb.jpg','06_osch_21-thumb.jpg','06_osch_22-thumb.jpg','06_osch_23-thumb.jpg','06_osch_24-thumb.jpg','06_osch_25-thumb.jpg','06_osch_26-thumb.jpg','06_osch_27-thumb.jpg','06_osch_28-thumb.jpg','06_osch_29-thumb.jpg'] },
  { id: 'newSchools', images: ['06_osch_32-thumb.jpg','06_osch_40-thumb.jpg','06_osch_47-thumb.jpg','06_osch_48-thumb.jpg','06_osch_52-thumb.jpg','06_osch_53-thumb.jpg','06_osch_54-thumb.jpg','06_osch_55-thumb.jpg','06_osch_56-thumb.jpg','06_osch_59-thumb.jpg','06_osch_60-thumb.jpg','06_osch_61-thumb.jpg','06_osch_63-thumb.jpg','06_osch_64-thumb.jpg','06_osch_66-thumb.jpg','06_osch_67-thumb.jpg','06_osch_68-thumb.jpg','06_osch_69-thumb.jpg','06_osch_70-thumb.jpg','06_osch_71-thumb.jpg','06_osch_72-thumb.jpg','06_osch_73-thumb.jpg'] },
  { id: 'fieldTrip', images: ['04_02-thumb.jpg','04_03-thumb.jpg','04_05-thumb.jpg','04_06-thumb.jpg','04_07-thumb.jpg','04_12-thumb.jpg','04_13-thumb.jpg','04_16-thumb.jpg','04_17-thumb.jpg','04_18-thumb.jpg','04_19-thumb.jpg','04_20-thumb.jpg','04_25-thumb.jpg','04_29-thumb.jpg','04_31-thumb.jpg','04_32-thumb.jpg','04_33-thumb.jpg','04_34-thumb.jpg','04_35-thumb.jpg','04_36-thumb.jpg','04_37-thumb.jpg','04_38-thumb.jpg','04_41-thumb.jpg','04_43-thumb.jpg'] },
  { id: 'hkCharity', images: ['07_02-thumb.jpg','07_03-thumb.jpg','07_04-thumb.jpg','07_05-thumb.jpg','07_08-thumb.jpg','07_09-thumb.jpg','07_10-thumb.jpg','07_11-thumb.jpg','07_12-thumb.jpg','07_13-thumb.jpg','07_15-thumb.jpg','07_2019ma1-thumb.jpg','07_2019ma2-thumb.jpg','07_2019ma3-thumb.jpg','07_2021ma1-thumb.jpg','07_2021ma2-thumb.jpg','07_20-thumb.jpg','07_21-thumb.jpg','07_24-thumb.jpg','07_27-thumb.jpg','07_28-thumb.jpg','07_29-thumb.jpg','07_30-thumb.jpg'] },
  { id: 'mountain', images: ['01_00-thumb.jpg','01_07-thumb.jpg','01_08-thumb.jpg','01_09-thumb.jpg','01_10-thumb.jpg','01_11-thumb.jpg','01_13-thumb.jpg','01_15-thumb.jpg','01_16-thumb.jpg','01_17-thumb.jpg','01_22-thumb.jpg','01_23-thumb.jpg','01_27-thumb.jpg','01_28-thumb.jpg','01_31-thumb.jpg','01_32-thumb.jpg','01_34-thumb.jpg','01_37-thumb.jpg','01_39-thumb.jpg','01_40-thumb.jpg','01_43-thumb.jpg','01_44-thumb.jpg','01_45-thumb.jpg','01_46-thumb.jpg','01_47-thumb.jpg','01_48-thumb.jpg','01_49-thumb.jpg','01_50-thumb.jpg'] },
  { id: 'activities', images: ['13_01-thumb.jpg','13_02-thumb.jpg','13_03-thumb.jpg','13_04-thumb.jpg','13_05-thumb.jpg','13_06-thumb.jpg','13_07-thumb.jpg','13_11-thumb.jpg','13_12-thumb.jpg','13_13-thumb.jpg','13_14-thumb.jpg','13_15-thumb.jpg','13_16-thumb.jpg'] },
];

const dirMap: Record<string, string> = {
  snowDisaster: '/gallery/snow/',
  oldSchools: '/gallery/schools-old/',
  newSchools: '/gallery/schools-new/',
  fieldTrip: '/gallery/field-trip/',
  hkCharity: '/gallery/hk-charity/',
  mountain: '/gallery/mountain/',
  activities: '/gallery/activities/',
};

export default function GalleryPage() {
  const t = useTranslations('gallery');
  const [lightbox, setLightbox] = useState<{ dir: string; images: string[]; index: number } | null>(null);
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
      {gallerySections.map((section, idx) => {
        const dir = dirMap[section.id] || '/gallery/';
        const titleKey = `${section.id}Title`;
        const enKey = `${section.id}En`;
        const descKey = `${section.id}Desc`;
        return (
          <section key={section.id} className="py-12"
            style={{
              backgroundColor: idx % 2 === 0 ? 'var(--color-bg-base)' : 'var(--color-bg-surface)',
              borderBottom: '1px solid var(--color-border)',
            }}>
            <div className="container-main">
              <div className="mb-6">
                <p className="reveal text-label mb-2" style={{ color: 'var(--color-primary-600)' }}>
                  {t(enKey)}
                </p>
                <h2 className="reveal text-title font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {t(titleKey)}
                </h2>
                <p className="reveal text-body-sm max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
                  {t(descKey)}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {section.images.map((img, i) => (
                  <div key={i} className="reveal aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setLightbox({ dir, images: section.images, index: i })}>
                    <img src={`${dir}${img}`} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
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
              <span className="text-5xl block mb-3" style={{ color: 'var(--color-primary-500)', opacity: 0.5, lineHeight: 1 }}>"</span>
              <p className="text-body-lg italic mb-4" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
                {t('quote1')}
              </p>
              <p className="text-label" style={{ color: 'var(--color-primary-400)' }}>{t('author1')}</p>
            </div>
            <div className="reveal pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-5xl block mb-3" style={{ color: 'var(--color-primary-500)', opacity: 0.5, lineHeight: 1 }}>"</span>
              <p className="text-body-lg italic mb-4" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
                {t('quote2')}
              </p>
              <p className="text-label" style={{ color: 'var(--color-primary-400)' }}>{t('author2')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* News & Others */}
      <section className="py-12" style={{ backgroundColor: 'var(--color-bg-base)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container-main">
          <p className="reveal text-label mb-2" style={{ color: 'var(--color-primary-600)' }}>{t('newsLabel')}</p>
          <h2 className="reveal text-title font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>{t('newsTitle')}</h2>
          <p className="reveal text-body-sm mb-6 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>{t('newsDesc')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {['15_145-thumb.jpg','15_146-thumb.jpg','15_147-thumb.jpg','15_148-thumb.jpg','15_149-thumb.jpg','15_News7-thumb.jpg','15_mooncake2018-thumb.jpg','15_mooncake2019-thumb.jpg','15_mooncake2020-thumb.jpg','15_mooncake2021-thumb.jpg'].map((img, i) => (
              <div key={i} className="reveal aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setLightbox({ dir: '/gallery/news/', images: ['15_145-thumb.jpg','15_146-thumb.jpg','15_147-thumb.jpg','15_148-thumb.jpg','15_149-thumb.jpg','15_News7-thumb.jpg','15_mooncake2018-thumb.jpg','15_mooncake2019-thumb.jpg','15_mooncake2020-thumb.jpg','15_mooncake2021-thumb.jpg'], index: i })}>
                <img src={`/gallery/news/${img}`} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main">
          <p className="reveal text-label mb-2" style={{ color: 'var(--color-primary-600)' }}>{t('othersLabel')}</p>
          <h2 className="reveal text-title font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>{t('othersTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {['12_01-thumb.jpg','12_02a-thumb.jpg','12_02b-thumb.jpg','12_03-thumb.jpg','12_04-thumb.jpg','12_05-thumb.jpg','12_06-thumb.jpg','12_07-thumb.jpg','12_08-thumb.jpg','12_09-thumb.jpg','12_10-thumb.jpg','12_11-thumb.jpg','12_12-thumb.jpg','12_13-thumb.jpg','12_14-thumb.jpg'].map((img, i) => (
              <div key={i} className="reveal aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setLightbox({ dir: '/gallery/others/', images: ['12_01-thumb.jpg','12_02a-thumb.jpg','12_02b-thumb.jpg','12_03-thumb.jpg','12_04-thumb.jpg','12_05-thumb.jpg','12_06-thumb.jpg','12_07-thumb.jpg','12_08-thumb.jpg','12_09-thumb.jpg','12_10-thumb.jpg','12_11-thumb.jpg','12_12-thumb.jpg','12_13-thumb.jpg','12_14-thumb.jpg'], index: i })}>
                <img src={`/gallery/others/${img}`} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
              </div>
            ))}
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
          <img src={`${lightbox.dir}${thumbToOriginal(lightbox.images[lightbox.index])}`} alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs font-medium tracking-wider">
            {lightbox.index + 1} / {lightbox.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
