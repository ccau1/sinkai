'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const accordionItems = [
  { id: '1', key: 'plan1' },
  { id: '2', key: 'plan2' },
  { id: '3', key: 'plan3' },
];

export default function AboutPage() {
  const locale = useLocale();
  const t = useTranslations('about');
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!pageRef.current) return;
      gsap.fromTo(
        pageRef.current.querySelectorAll('.reveal'),
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: pageRef.current, start: 'top 85%' },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const achievements = [
    { key: 'achievement1', value: 'achievement1Value' },
    { key: 'achievement2', value: 'achievement2Value' },
    { key: 'achievement3', value: 'achievement3Value' },
    { key: 'achievement4', value: 'achievement4Value' },
    { key: 'achievement5', value: 'achievement5Value' },
  ];

  const guizhouStats = [
    { number: '67,992', unit: 'km²', label: '总面积' },
    { number: '92.5%', unit: '', label: '高原山脉' },
    { number: '1,000-2,900', unit: 'm', label: '海拔高度' },
    { number: '49', unit: '个', label: '聚居部族' },
  ];

  return (
    <div ref={pageRef}>
      {/* Page Title */}
      <section className="section text-center" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main">
          <h1 className="reveal text-headline font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {t('pageTitle')}
          </h1>
          <p className="reveal text-body-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            {t('pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Background */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="reveal text-label mb-3" style={{ color: 'var(--color-primary-600)' }}>
                {t('backgroundLabel')}
              </p>
              <h2 className="reveal text-title font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                {t('backgroundTitle')}
              </h2>
              <p className="reveal text-body mb-4" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                {t('backgroundText1')}
              </p>
              <p className="reveal text-body" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                {t('backgroundText2')}
              </p>
            </div>
            <div className="reveal relative aspect-square rounded-2xl overflow-hidden">
              <img src="/images/parallax-layer1.jpg" alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Accordion */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main max-w-3xl">
          <p className="reveal text-label mb-3 text-center" style={{ color: 'var(--color-primary-600)' }}>
            {t('plansLabel')}
          </p>
          <h2 className="reveal text-title font-bold mb-8 text-center" style={{ color: 'var(--color-text-primary)' }}>
            {t('plansTitle')}
          </h2>
          <div className="space-y-3">
            {accordionItems.map((item, i) => {
              const isOpen = openIdx === i;
              return (
                <div key={item.id} className="reveal rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors duration-200"
                    style={{ backgroundColor: isOpen ? 'var(--color-primary-50)' : 'var(--color-bg-base)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-label" style={{ color: 'var(--color-primary-600)' }}>{item.id}</span>
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {t(`${item.key}Title`)}
                      </span>
                    </div>
                    <span className="text-lg transition-transform duration-300" style={{ color: 'var(--color-text-tertiary)', transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                  </button>
                  <div className="overflow-hidden transition-all duration-500" style={{ maxHeight: isOpen ? '500px' : '0' }}>
                    <div className="p-5 pt-0 text-body" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                      {t(`${item.key}Text`)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guizhou */}
      <section className="section" style={{ backgroundColor: 'var(--color-primary-900)' }}>
        <div className="container-main text-center">
          <p className="reveal text-label mb-3" style={{ color: 'var(--color-primary-300)' }}>
            {t('guizhouLabel')}
          </p>
          <h2 className="reveal text-headline font-bold mb-8" style={{ color: 'var(--color-primary-100)' }}>
            {t('guizhouTitle')}
          </h2>
          <div className="reveal grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {guizhouStats.map((s, i) => (
              <div key={i} className="p-4">
                <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-300)' }}>{s.number}<span className="text-sm ml-1">{s.unit}</span></p>
                <p className="text-label mt-1" style={{ color: 'var(--color-primary-400)' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="reveal max-w-3xl mx-auto text-left">
            <p className="text-body mb-4" style={{ color: 'var(--color-primary-200)', lineHeight: 1.8 }}>
              {t('guizhouText1')}
            </p>
            <p className="text-body" style={{ color: 'var(--color-primary-200)', lineHeight: 1.8 }}>
              {t('guizhouText2')}
            </p>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          <p className="reveal text-label mb-3" style={{ color: 'var(--color-primary-600)' }}>
            {t('achievementsLabel')}
          </p>
          <h2 className="reveal text-title font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
            {t('achievementsTitle')}
          </h2>
          <div className="space-y-0">
            {achievements.map((a, i) => (
              <div key={i} className="reveal flex items-center justify-between py-4 px-4 rounded-lg transition-colors duration-150"
                style={{ borderBottom: '1px solid var(--color-border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <div className="flex items-center gap-4">
                  <span className="text-label hidden sm:inline" style={{ color: 'var(--color-text-tertiary)' }}>0{i + 1}</span>
                  <span className="text-body" style={{ color: 'var(--color-text-primary)' }}>{t(a.key)}</span>
                </div>
                <span className="font-semibold text-sm" style={{ color: 'var(--color-primary-600)' }}>{t(a.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main text-center">
          <p className="reveal text-label mb-3" style={{ color: 'var(--color-primary-600)' }}>
            {t('quoteLabel')}
          </p>
          <h2 className="reveal text-title font-bold mb-10" style={{ color: 'var(--color-text-primary)' }}>
            {t('quoteTitle')}
          </h2>
          <div className="reveal max-w-2xl mx-auto">
            <span className="font-serif text-6xl block mb-4" style={{ color: 'var(--color-primary-300)', lineHeight: 1 }}>"</span>
            <p className="text-body-lg italic mb-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              {t('quoteText')}
            </p>
            <p className="text-label" style={{ color: 'var(--color-primary-600)' }}>{t('quoteAuthor')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
