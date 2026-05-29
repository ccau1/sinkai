'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations('home');
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero parallax layers
      const layers = heroRef.current?.querySelectorAll('.parallax-layer');
      layers?.forEach((layer, i) => {
        gsap.to(layer, {
          yPercent: -15 * (i + 1) * 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current!,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // Fade-in animations
      [aboutRef, statsRef, activitiesRef].forEach((ref) => {
        if (!ref.current) return;
        gsap.fromTo(
          ref.current.querySelectorAll('.reveal'),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  const stats = [
    { number: '18+', label: t('statSchools'), desc: t('statSchoolsDesc') },
    { number: '100%', label: t('statDonation'), desc: t('statDonationDesc') },
    { number: '27+', label: t('statYears'), desc: t('statYearsDesc') },
  ];

  const activities = [
    { key: 'school', img: '/images/school-opening.jpg' },
    { key: 'field', img: '/images/volunteer-visit.jpg' },
    { key: 'elderly', img: '/images/mid-autumn-event.jpg' },
    { key: 'mooncake', img: '/images/mooncake.jpg' },
    { key: 'students', img: '/images/parallax-layer4.jpg' },
    { key: 'survey', img: '/images/parallax-layer3.jpg' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Parallax background layers */}
        <div className="parallax-layer absolute inset-0 z-0">
          <Image src="/images/parallax-layer1.jpg" alt="" fill className="object-cover" priority />
        </div>
        <div className="parallax-layer absolute inset-0 z-[1] opacity-60">
          <Image src="/images/parallax-layer2.jpg" alt="" fill className="object-cover" priority />
        </div>
        <div className="parallax-layer absolute inset-0 z-[2] opacity-40">
          <Image src="/images/parallax-layer3.jpg" alt="" fill className="object-cover" priority />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 z-[3]"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)' }} />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <p className="text-label mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {t('tagline')}
          </p>
          <h1 className="text-display font-bold mb-6 text-white" style={{ textShadow: '0 2px 30px rgba(0,0,0,0.3)' }}>
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`/${locale}/about`} className="btn-primary inline-block">
              {t('btnAbout')}
            </Link>
            <Link href={`/${locale}/donate`}
              className="inline-block px-8 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; }}>
              {t('btnDonate')}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* About Preview */}
      <section ref={aboutRef} className="section"
        style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="reveal text-label mb-3" style={{ color: 'var(--color-primary-600)' }}>
                ABOUT SIN KAI
              </p>
              <h2 className="reveal text-headline font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                {t('aboutTitle')}
              </h2>
              <p className="reveal text-body-lg mb-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                {t('aboutText')}
              </p>
              <Link href={`/${locale}/about`} className="reveal inline-flex items-center gap-2 font-semibold transition-colors duration-200"
                style={{ color: 'var(--color-primary-600)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary-700)'; }}>
                {t('aboutLink')} →
              </Link>
            </div>
            <div className="reveal relative aspect-video rounded-2xl overflow-hidden">
              <Image src="/images/parallax-layer4.jpg" alt="" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="section"
        style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="reveal text-center p-8 rounded-2xl"
                style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--color-primary-600)' }}>
                  {stat.number}
                </p>
                <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {stat.label}
                </p>
                <p className="text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section ref={activitiesRef} className="section"
        style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="reveal text-label mb-3" style={{ color: 'var(--color-primary-600)' }}>
              OUR WORK
            </p>
            <h2 className="reveal text-headline font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {t('activitiesTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act, i) => (
              <div key={i} className="reveal group rounded-xl overflow-hidden"
                style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                <div className="relative aspect-video overflow-hidden">
                  <Image src={act.img} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {t(`activities.${act.key}.title`)}
                  </h3>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {t(`activities.${act.key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
