'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function DonatePage() {
  const t = useTranslations('donate');
  const pageRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const [formVisible, setFormVisible] = useState(false);

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

  const shimmerIn = () => {
    if (shimmerRef.current) gsap.to(shimmerRef.current, { left: '150%', duration: 0.5, ease: 'power1.inOut' });
  };
  const shimmerOut = () => {
    if (shimmerRef.current) gsap.to(shimmerRef.current, { left: '-100%', duration: 0.3, ease: 'none' });
  };

  const methods = [
    { icon: 'bank', title: t('bankTransfer'), content: t('bankAccount'), note: t('bankNote') },
    { icon: 'cheque', title: t('cheque'), content: t('chequeDetail'), note: t('chequeNote') },
    { icon: 'location', title: t('inPerson'), content: t('inPersonAddress'), note: t('inPersonNote') },
  ];

  const purposes = [
    { icon: '🏫', title: t('schoolBuilding'), desc: t('schoolBuildingDesc') },
    { icon: '🎓', title: t('studentAid'), desc: t('studentAidDesc') },
    { icon: '🆘', title: t('emergency'), desc: t('emergencyDesc') },
  ];

  const specs = [0, 1, 2, 3].map((i) => t(`mooncakeSpecs.${i}`));

  return (
    <div ref={pageRef}>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[300px]">
        <Image src="/images/school-opening.jpg" alt={t('pageTitle')} fill className="object-cover" priority />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container-main text-center">
            <h1 className="text-headline font-bold text-white mb-4">
              {t('pageTitle')}
            </h1>
            <p className="text-body-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {t('pageSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Methods */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          <h2 className="reveal text-title font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {t('methodsTitle')}
          </h2>
          <p className="reveal text-body mb-10 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
            {t('methodsDesc')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {methods.map((m, i) => (
              <div key={i} className="reveal p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--color-primary-100)' }}>
                  <MethodIcon name={m.icon} />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{m.title}</h3>
                <p className="text-body-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>{m.content}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Purposes */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main">
          <h2 className="reveal text-title font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
            {t('purposesTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {purposes.map((p, i) => (
              <div key={i} className="reveal p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)' }}>
                <span className="text-3xl mb-3 block">{p.icon}</span>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{p.title}</h3>
                <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mooncake */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="reveal text-label mb-3" style={{ color: 'var(--color-primary-600)' }}>
                ANNUAL EVENT
              </p>
              <h2 className="reveal text-title font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                {t('mooncakeTitle')}
              </h2>
              <p className="reveal text-body mb-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                {t('mooncakeDesc')}
              </p>
              <ul className="space-y-2">
                {specs.map((s, i) => (
                  <li key={i} className="reveal text-body-sm flex items-start gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-primary-500)' }}>•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal relative aspect-square rounded-2xl overflow-hidden">
              <Image src="/images/mooncake.jpg" alt="Mooncake" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Account Info */}
      <section className="section text-center" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main">
          <h2 className="reveal text-title font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {t('accountTitle')}
          </h2>
          <p className="reveal text-lg font-semibold mb-2" style={{ color: 'var(--color-primary-600)' }}>
            {t('accountDetail')}
          </p>
          <p className="reveal text-body-sm mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('accountNote')}
          </p>
          <div className="reveal flex flex-wrap gap-4 justify-center mb-8">
            <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('contactPhone')}</span>
            <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('contactFax')}</span>
            <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('contactEmail')}</span>
          </div>
          <div className="reveal relative inline-block overflow-hidden rounded-lg">
            <button
              className="relative px-12 py-4 font-semibold overflow-hidden rounded-lg"
              style={{ backgroundColor: 'var(--color-primary-600)', color: 'var(--color-text-on-primary)' }}
              onMouseEnter={shimmerIn}
              onMouseLeave={shimmerOut}
            >
              {t('donateBtn')}
              <div ref={shimmerRef} className="absolute top-0" style={{ left: '-100%', width: '60px', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', pointerEvents: 'none' }} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MethodIcon({ name }: { name: string }) {
  const color = 'var(--color-primary-600)';
  if (name === 'bank') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/><path d="M6 14h4"/></svg>
  );
  if (name === 'cheque') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  );
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  );
}
