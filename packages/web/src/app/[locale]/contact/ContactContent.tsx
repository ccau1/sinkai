'use client';

import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FormRenderer from '@/components/FormRenderer';
import type { CMSForm } from '@/lib/cms';

gsap.registerPlugin(ScrollTrigger);

interface ContactContentProps {
  form?: CMSForm | null;
}

export default function ContactContent({ form }: ContactContentProps) {
  const t = useTranslations('contact');
  const pageRef = useRef<HTMLDivElement>(null);
  const [mapOpen, setMapOpen] = useState(false);

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

  const infoBlocks = [
    { icon: 'map', label: t('addressLabel'), lines: [t('address1'), t('address2'), t('mtr')] },
    { icon: 'phone', label: t('phoneLabel'), lines: [t('phone')] },
    { icon: 'fax', label: t('faxLabel'), lines: [t('fax')] },
    { icon: 'email', label: t('emailLabel'), lines: [t('email')] },
  ];

  return (
    <div ref={pageRef}>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[300px]">
        <Image src="/gallery/snow/16_37.jpg" alt={t('pageTitle')} fill className="object-cover" priority />
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

      {/* Contact Info & Form */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12">
            {/* Left - Info */}
            <div>
              <p className="reveal text-label mb-6" style={{ color: 'var(--color-primary-600)' }}>
                {t('contactInfoLabel')}
              </p>
              <div className="space-y-6">
                {infoBlocks.map((block, i) => (
                  <div key={i} className="reveal">
                    <div className="flex items-center gap-3 mb-2">
                      <ContactIcon name={block.icon} />
                      <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{block.label}</h4>
                    </div>
                    {block.lines.map((line, li) => (
                      <p key={li} className="text-body-sm ml-8" style={{ color: li === block.lines.length - 1 && block.lines.length > 1 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)' }}>
                        {line}
                      </p>
                    ))}
                    {block.icon === 'map' && (
                      <div
                        className="ml-8 mt-3 rounded-lg overflow-hidden cursor-pointer"
                        style={{ height: '120px', border: '1px solid var(--color-border)' }}
                        onClick={() => setMapOpen(true)}
                      >
                        <iframe
                          src="https://maps.google.com/maps?q=Charm+Centre,+700+Castle+Peak+Road,+Lai+Chi+Kok,+Hong+Kong&t=&z=16&ie=UTF8&iwloc=&output=embed"
                          width="100%"
                          height="100%"
                          style={{ border: 0, pointerEvents: 'none' }}
                          loading="lazy"
                          title="Map preview"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="reveal mt-8 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{t('registration')}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{t('license')}</p>
              </div>
            </div>

            {/* Right - Form */}
            <div>
              <p className="reveal text-label mb-6" style={{ color: 'var(--color-primary-600)' }}>
                {t('formLabel')}
              </p>
              {form ? (
                <FormRenderer form={form} />
              ) : (
                <p className="reveal text-sm" style={{ color: 'var(--color-error, #dc2626)' }}>
                  {t('formError')}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Modal */}
      {mapOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setMapOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: 'var(--color-bg-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{t('addressLabel')}</h3>
              <button
                onClick={() => setMapOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 transition-colors"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div style={{ height: '60vh', minHeight: '400px' }}>
              <iframe
                src="https://maps.google.com/maps?q=Charm+Centre,+700+Castle+Peak+Road,+Lai+Chi+Kok,+Hong+Kong&t=&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                title="Google Map"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactIcon({ name }: { name: string }) {
  const c = 'var(--color-primary-500)';
  if (name === 'map') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  );
  if (name === 'phone') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  );
  if (name === 'fax') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  );
}
