'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GallerySection {
  id: string;
  images: string[];
}

const gallerySections: GallerySection[] = [
  { id: 'snowDisaster', images: ['16_01s.jpg','16_02s.jpg','16_07s.jpg','16_08s.jpg','16_09s.jpg','16_10s.jpg','16_13s.jpg','16_15s.jpg','16_23s.jpg','16_25s.jpg','16_26s.jpg','16_27s.jpg','16_28s.jpg','16_29s.jpg','16_30s.jpg','16_31s.jpg','16_32s.jpg','16_33s.jpg','16_34s.jpg','16_35s.jpg','16_36s.jpg','16_37s.jpg','16_38s.jpg','16_39s.jpg','16_40s.jpg','16_41s.jpg','16_42s.jpg','16_43s.jpg','16_44s.jpg','16_45s.jpg','16_46s.jpg','16_47s.jpg','16_48s.jpg','16_49s.jpg'] },
  { id: 'oldSchools', images: ['06_osch_01s.jpg','06_osch_02s.jpg','06_osch_04s.jpg','06_osch_05s.jpg','06_osch_06s.jpg','06_osch_07s.jpg','06_osch_08s.jpg','06_osch_09s.jpg','06_osch_10s.jpg','06_osch_12s.jpg','06_osch_13s.jpg','06_osch_14s.jpg','06_osch_15s.jpg','06_osch_16s.jpg','06_osch_17s.jpg','06_osch_18s.jpg','06_osch_19s.jpg','06_osch_20s.jpg','06_osch_21s.jpg','06_osch_22s.jpg','06_osch_23s.jpg','06_osch_24s.jpg','06_osch_25s.jpg','06_osch_26s.jpg','06_osch_27s.jpg','06_osch_28s.jpg','06_osch_29s.jpg'] },
  { id: 'newSchools', images: ['06_osch_32s.jpg','06_osch_40s.jpg','06_osch_47s.jpg','06_osch_48s.jpg','06_osch_52s.jpg','06_osch_53s.jpg','06_osch_54s.jpg','06_osch_55s.jpg','06_osch_56s.jpg','06_osch_59s.jpg','06_osch_60s.jpg','06_osch_61s.jpg','06_osch_63s.jpg','06_osch_64s.jpg','06_osch_66s.jpg','06_osch_67s.jpg','06_osch_68s.jpg','06_osch_69s.jpg','06_osch_70s.jpg','06_osch_71s.jpg','06_osch_72s.jpg','06_osch_73s.jpg'] },
  { id: 'fieldTrip', images: ['04_02s.jpg','04_03s.jpg','04_05s.jpg','04_06s.jpg','04_07s.jpg','04_12s.jpg','04_13s.jpg','04_16s.jpg','04_17s.jpg','04_18s.jpg','04_19s.jpg','04_20s.jpg','04_25s.jpg','04_29s.jpg','04_31s.jpg','04_32s.jpg','04_33s.jpg','04_34s.jpg','04_35s.jpg','04_36s.jpg','04_37s.jpg','04_38s.jpg','04_41s.jpg','04_43s.jpg'] },
  { id: 'hkCharity', images: ['07_02s.jpg','07_03s.jpg','07_04s.jpg','07_05s.jpg','07_08s.jpg','07_09s.jpg','07_10s.jpg','07_11s.jpg','07_12s.jpg','07_13s.jpg','07_15s.jpg','07_2019ma1s.jpg','07_2019ma2s.jpg','07_2019ma3s.jpg','07_2021ma1s.jpg','07_2021ma2s.jpg','07_20s.jpg','07_21s.jpg','07_24s.jpg','07_27s.jpg','07_28s.jpg','07_29s.jpg','07_30s.jpg'] },
  { id: 'mountain', images: ['01_00s.jpg','01_07s.jpg','01_08s.jpg','01_09s.jpg','01_10s.jpg','01_11s.jpg','01_13s.jpg','01_15s.jpg','01_16s.jpg','01_17s.jpg','01_22s.jpg','01_23s.jpg','01_27s.jpg','01_28s.jpg','01_31s.jpg','01_32s.jpg','01_34s.jpg','01_37s.jpg','01_39s.jpg','01_40s.jpg','01_43s.jpg','01_44s.jpg','01_45s.jpg','01_46s.jpg','01_47s.jpg','01_48s.jpg','01_49s.jpg','01_50s.jpg'] },
  { id: 'activities', images: ['13_01s.jpg','13_02s.jpg','13_03s.jpg','13_04s.jpg','13_05s.jpg','13_06s.jpg','13_07s.jpg','13_11z.jpg','13_12s.jpg','13_13s.jpg','13_14s.jpg','13_15s.jpg','13_16s.jpg'] },
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
            {['15_145s.jpg','15_146s.jpg','15_147s.jpg','15_148s.jpg','15_149s.jpg','15_News7s.jpg','15_mooncake2018s.jpg','15_mooncake2019s.jpg','15_mooncake2020s.jpg','15_mooncake2021s.jpg'].map((img, i) => (
              <div key={i} className="reveal aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setLightbox({ dir: '/gallery/news/', images: ['15_145s.jpg','15_146s.jpg','15_147s.jpg','15_148s.jpg','15_149s.jpg','15_News7s.jpg','15_mooncake2018s.jpg','15_mooncake2019s.jpg','15_mooncake2020s.jpg','15_mooncake2021s.jpg'], index: i })}>
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
            {['12_01s.jpg','12_02as.jpg','12_02bs.jpg','12_03s.jpg','12_04s.jpg','12_05s.jpg','12_06s.jpg','12_07s.jpg','12_08s.jpg','12_09s.jpg','12_10s.jpg','12_11s.jpg','12_12s.jpg','12_13s.jpg','12_14s.jpg'].map((img, i) => (
              <div key={i} className="reveal aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setLightbox({ dir: '/gallery/others/', images: ['12_01s.jpg','12_02as.jpg','12_02bs.jpg','12_03s.jpg','12_04s.jpg','12_05s.jpg','12_06s.jpg','12_07s.jpg','12_08s.jpg','12_09s.jpg','12_10s.jpg','12_11s.jpg','12_12s.jpg','12_13s.jpg','12_14s.jpg'], index: i })}>
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
          <img src={`${lightbox.dir}${lightbox.images[lightbox.index]}`} alt=""
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
