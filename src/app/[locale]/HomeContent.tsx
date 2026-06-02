'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations('home');
  const tAbout = useTranslations('about');
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [counts, setCounts] = useState({ schools: 0, donation: 0, years: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero parallax layers
      const layers = heroRef.current?.querySelectorAll('.parallax-layer');
      layers?.forEach((layer, i) => {
        gsap.to(layer, {
          yPercent: -20 * (i + 1) * 0.25,
          scale: 1.1,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current!,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // Hero content fade out on scroll
      gsap.to('.hero-content', {
        opacity: 0,
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current!,
          start: 'top top',
          end: '50% top',
          scrub: true,
        },
      });

      // Vertical texts fly in first
      gsap.fromTo('.hero-text-left',
        { x: -120, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0 }
      );
      gsap.fromTo('.hero-text-right',
        { x: 120, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0 }
      );

      // Scooping hands animation - move together to protect children
      gsap.fromTo('.hero-hand-left',
        { x: '-55vw', opacity: 0 },
        { x: 0, opacity: 0.7, duration: 1.8, ease: 'power3.out', delay: 0.5 }
      );
      gsap.fromTo('.hero-hand-right',
        { x: '55vw', opacity: 0 },
        { x: 0, opacity: 0.7, duration: 1.8, ease: 'power3.out', delay: 0.5 }
      );


      // Vertical texts stay visible on scroll (same as hands)

      // Reveal animations for sections
      const revealSections = [storyRef, impactRef, workRef, quoteRef, ctaRef];
      revealSections.forEach((ref) => {
        if (!ref.current) return;
        gsap.fromTo(
          ref.current.querySelectorAll('.reveal'),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power2.out',
            stagger: 0.12,
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Impact image parallax
      const impactImg = impactRef.current?.querySelector('.impact-img');
      if (impactImg) {
        gsap.to(impactImg, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: impactRef.current!,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Stat counter animation
      ScrollTrigger.create({
        trigger: impactRef.current!,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          const obj = { schools: 0, donation: 0, years: 0 };
          gsap.to(obj, {
            schools: 18,
            donation: 100,
            years: 27,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              setCounts({
                schools: Math.round(obj.schools),
                donation: Math.round(obj.donation),
                years: Math.round(obj.years),
              });
            },
          });
        },
      });

      // Work cards stagger
      if (workRef.current) {
        gsap.fromTo(
          workRef.current.querySelectorAll('.work-card'),
          { y: 60, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: workRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const stats = [
    { number: `${counts.schools}+`, label: t('statSchools'), desc: t('statSchoolsDesc') },
    { number: `${counts.donation}%`, label: t('statDonation'), desc: t('statDonationDesc') },
    { number: `${counts.years}+`, label: t('statYears'), desc: t('statYearsDesc') },
  ];

  const activities = [
    { key: 'school', img: '/images/school-opening.jpg' },
    { key: 'field', img: '/images/parallax-layer4.jpg' },
    { key: 'elderly', img: '/images/mid-autumn-event.jpg' },
    { key: 'mooncake', img: '/images/mooncake.jpg' },
    { key: 'students', img: '/gallery/activities/13_01-thumb.jpg' },
    { key: 'survey', img: '/gallery/hk-charity/07_02-thumb.jpg' },
  ];

  return (
    <div>
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section ref={heroRef} className="relative pt-16 min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Parallax background layers */}
        <div className="parallax-layer absolute inset-0 z-0">
          <Image src="/images/parallax-layer1.jpg" alt="" fill className="object-cover" priority />
        </div>
        <div className="parallax-layer absolute inset-0 z-[1] opacity-20">
          <Image src="/images/parallax-layer4.jpg" alt="" fill className="object-cover" priority />
        </div>

        {/* Warm light overlay — bright and airy */}
        <div className="absolute inset-0 z-[3]"
          style={{
            background: 'linear-gradient(135deg, rgba(180,140,60,0.15) 0%, rgba(100,140,80,0.1) 40%, rgba(160,120,50,0.12) 70%, rgba(140,110,40,0.08) 100%)'
          }} />

        {/* Soft fade to story section background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 z-[4] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, var(--color-bg-base) 100%)'
          }} />

        {/* Hands wrapper — centers hands in the content area below the fixed header */}
        <div className="absolute inset-x-0 top-16 bottom-0 pointer-events-none flex items-center justify-between">
          {/* Left hand - scoops in from far left */}
          <div className="hero-hand-left z-[5] w-[200px] sm:w-[280px] lg:w-[480px] xl:w-[576px] 2xl:w-[672px]"
            style={{ filter: 'drop-shadow(0 0 30px rgba(255,180,80,0.35))', opacity: 0.7 }}>
            <Image src="/images/hand-left.png" alt="" width={500} height={500} className="w-full h-auto" priority />
          </div>

          {/* Right hand - scoops in from far right */}
          <div className="hero-hand-right z-[5] w-[200px] sm:w-[280px] lg:w-[480px] xl:w-[576px] 2xl:w-[672px]"
            style={{ filter: 'drop-shadow(0 0 30px rgba(255,180,80,0.35))', opacity: 0.7 }}>
            <Image src="/images/hand-right.png" alt="" width={500} height={500} className="w-full h-auto" priority />
          </div>
        </div>

        {/* Left vertical text - flies in from left */}
        <div className="hero-text-left hidden xl:flex absolute left-[12%] top-1/2 -translate-y-1/2 z-20 items-center justify-center">
          <span className="text-[3.33rem] font-bold tracking-[0.25em]"
            style={{
              writingMode: 'vertical-rl',
              color: '#EE82EE',
              textShadow: '0 0 24px rgba(0,0,0,0.7), 0 0 48px rgba(0,0,0,0.5)'
            }}>
            善施恩惠烏蒙
          </span>
        </div>

        {/* Right vertical text - flies in from right */}
        <div className="hero-text-right hidden xl:flex absolute right-[12%] top-1/2 -translate-y-1/2 z-20 items-center justify-center">
          <span className="text-[3.33rem] font-bold tracking-[0.25em]"
            style={{
              writingMode: 'vertical-rl',
              color: '#EE82EE',
              textShadow: '0 0 24px rgba(0,0,0,0.7), 0 0 48px rgba(0,0,0,0.5)'
            }}>
            啟願溫暖人間
          </span>
        </div>

        {/* Content */}
        <div className="hero-content relative z-10 text-center px-6 max-w-3xl mx-auto">
          {/* Mission statements */}
          <div className="mb-6 space-y-1">
            <p className="text-sm md:text-base tracking-wider" style={{ color: 'rgba(255,255,255,0.85)' }}>
              發揚互助精神 · 倡導德行教育
            </p>
            <p className="text-sm md:text-base tracking-wider" style={{ color: 'rgba(255,255,255,0.85)' }}>
              為社會的文明建設作出無私奉獻
            </p>
          </div>

          {/* Main title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1 text-white" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
            讓人間
          </h1>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3" style={{ color: '#FF6B9D', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            多一分溫暖
          </h1>
          <p className="text-lg md:text-xl mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>
            少一分痛苦。
          </p>

          {/* Foundation name */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#90EE90', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
              善啟慈善基金會
            </h2>
            <p className="text-sm tracking-widest uppercase font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              SIN KAI FUNDS LIMITED
            </p>
          </div>

          {/* Registration */}
          <p className="text-xs md:text-sm mb-10 tracking-wide" style={{ color: 'rgba(255,255,255,0.6)' }}>
            政府註冊 零行政費 非牟利機構，牌照號碼：658073
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`/${locale}/about`} className="btn-primary inline-block">
              {t('btnAbout')}
            </Link>
            <Link href={`/${locale}/donate`}
              className="inline-block px-8 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              {t('btnDonate')}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Scroll</span>
          <div className="animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </section>

      {/* ============================================
          STORY / MISSION SECTION
          White background with composite image collage
          ============================================ */}
      <section ref={storyRef}
        className="relative py-20 md:py-28"
        style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          {/* Composite image collage + text */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center mb-12 md:mb-16">
            {/* Left image */}
            <div className="lg:col-span-4 reveal">
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <Image src="/images/school-opening.jpg" alt="" fill className="object-cover" />
              </div>
            </div>

            {/* Center text */}
            <div className="lg:col-span-4 reveal text-center py-4 md:py-8">
              <p className="text-label mb-4 tracking-widest" style={{ color: 'var(--color-primary-600)' }}>
                {t('storyLabel')}
              </p>
              <h2 className="text-headline font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                {t('aboutTitle')}
              </h2>
              <p className="text-body-lg mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {t('aboutText')}
              </p>
              <Link href={`/${locale}/about`}
                className="inline-flex items-center gap-2 font-semibold transition-colors duration-200"
                style={{ color: 'var(--color-primary-600)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary-700)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-primary-600)'; }}>
                {t('aboutLink')} →
              </Link>
            </div>

            {/* Right image */}
            <div className="lg:col-span-4 reveal lg:mt-16">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <Image src="/images/mid-autumn-event.jpg" alt="" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Bottom wide image */}
          <div className="reveal relative aspect-[21/9] md:aspect-[3/1] rounded-[2rem] overflow-hidden shadow-xl">
            <Image src="/images/parallax-layer4.jpg" alt="" fill className="object-cover" />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.3) 100%)'
            }} />
          </div>
        </div>
      </section>

      {/* ============================================
          IMPACT SECTION
          Image + animated stats
          ============================================ */}
      <section ref={impactRef}
        className="relative py-24 md:py-32"
        style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image side */}
            <div className="reveal relative aspect-[4/5] md:aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl">
              <Image src="/images/parallax-layer4.jpg" alt="" fill className="impact-img object-cover scale-110" />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)'
              }} />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-semibold text-lg">{t('schoolCaption')}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('schoolLocation')}</p>
              </div>
            </div>

            {/* Stats side */}
            <div>
              <p className="reveal text-label mb-3 tracking-widest" style={{ color: 'var(--color-primary-600)' }}>
                {t('impactLabel')}
              </p>
              <h2 className="reveal text-headline font-bold mb-10" style={{ color: 'var(--color-text-primary)' }}>
                {t('impactTitle')}
              </h2>

              <div className="space-y-8">
                {stats.map((stat, i) => (
                  <div key={i} className="reveal flex items-start gap-6 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border)',
                    }}>
                    <div className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary-50)' }}>
                      <span className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-primary-600)' }}>
                        {stat.number}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        {stat.label}
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {stat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          OUR WORK SECTION
          Immersive card grid with people photos
          ============================================ */}
      <section ref={workRef}
        className="relative py-24 md:py-32"
        style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          <div className="text-center mb-16">
            <p className="reveal text-label mb-3 tracking-widest" style={{ color: 'var(--color-primary-600)' }}>
              {t('workLabel')}
            </p>
            <h2 className="reveal text-headline font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {t('activitiesTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
            {activities.map((act, i) => (
              <div key={i} className="work-card group relative w-full rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  paddingTop: '133.33%',
                }}>
                <div className="absolute inset-0">
                  <Image src={act.img} alt="" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)',
                    }} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h3 className="font-semibold text-xl mb-2 text-white transition-transform duration-500 group-hover:-translate-y-1">
                    {t(`activities.${act.key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed transition-all duration-500 opacity-80 group-hover:opacity-100"
                    style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {t(`activities.${act.key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          QUOTE / TESTIMONIAL SECTION
          Warm, human-centered
          ============================================ */}
      <section ref={quoteRef}
        className="relative py-24 md:py-32 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-800) 0%, var(--color-primary-900) 100%)',
        }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
          style={{ background: 'radial-gradient(circle, var(--color-primary-400) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 translate-y-1/2 -translate-x-1/2"
          style={{ background: 'radial-gradient(circle, var(--color-primary-400) 0%, transparent 70%)' }} />

        <div className="container-main relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="reveal text-label mb-6 tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t('quoteLabel')}
            </p>
            <div className="reveal mb-8">
              <svg className="w-12 h-12 mx-auto mb-6 opacity-30" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <blockquote className="reveal text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed mb-10 text-white">
              {tAbout('quoteText')}
            </blockquote>
            <p className="reveal text-sm tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {tAbout('quoteAuthor')}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          Full-bleed with parallax
          ============================================ */}
      <section ref={ctaRef} className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/parallax-layer4.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h2 className="reveal text-headline font-bold mb-6 text-white">
            {t('ctaTitle')}
          </h2>
          <p className="reveal text-lg md:text-xl mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {t('ctaSubtitle')}
          </p>
          <div className="reveal flex flex-wrap gap-4 justify-center">
            <Link href={`/${locale}/donate`} className="btn-primary inline-block text-lg px-10 py-4 rounded-xl">
              {t('btnDonate')}
            </Link>
            <Link href={`/${locale}/contact`}
              className="inline-block px-10 py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              {t('ctaVolunteer')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
