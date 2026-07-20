'use client';

import CmsImage from '@/components/CmsImage';
import { useTranslations, useLocale, useFormatter } from 'next-intl';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { CMSInstallation } from '@/lib/cms';
import { getInstallationTitle, getInstallationLocation, getInstallationDescription, getMediaAlt } from '@/lib/cms';


interface Props {
  schools: CMSInstallation[];
  bridges: CMSInstallation[];
  waterTanks: CMSInstallation[];
}

export default function InstallationsContent({ schools, bridges, waterTanks }: Props) {
  const t = useTranslations('installations');
  const locale = useLocale();
  const formatter = useFormatter();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current!.querySelectorAll('.reveal'),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.05,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const typeLabels: Record<CMSInstallation['type'], string> = {
    school: t('schools'),
    bridge: t('bridges'),
    'water-tank': t('waterTanks'),
  };

  const renderGroup = (items: CMSInstallation[], type: CMSInstallation['type']) => {
    if (items.length === 0) return null;
    return (
      <div key={type} className="mb-16">
        <h2 className="reveal text-title font-bold mb-8" style={{ color: 'var(--color-primary-700)' }}>
          {typeLabels[type]}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const title = getInstallationTitle(item);
            const location = getInstallationLocation(item);
            const description = getInstallationDescription(item);
            const photo = item.photos?.[0];
            return (
              <article
                key={item.id}
                id={item.slug}
                className="reveal rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {photo && (
                  <div className="relative aspect-video overflow-hidden">
                    <CmsImage
                      src={photo.url || ''}
                      filename={photo.filename}
                      alt={getMediaAlt(photo, locale)}
                      fill
                      size="thumb"
                      transformFit="cover"
                      transformFormat="auto"
                      transformQuality={85}
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {title}
                  </h3>
                  {item.completionDate && (
                    <p className="text-label mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                      {formatter.dateTime(new Date(item.completionDate), {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                  <p className="text-body-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {location}
                  </p>
                  {description && (
                    <p className="text-body-sm line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {description}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main text-center">
          <p className="text-label mb-3" style={{ color: 'var(--color-primary-600)' }}>
            SIN KAI INSTALLATIONS
          </p>
          <h1 className="text-headline font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {t('pageTitle')}
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            {t('pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section ref={sectionRef} className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          {[schools, bridges, waterTanks].every((g) => g.length === 0) ? (
            <p className="text-center text-body" style={{ color: 'var(--color-text-secondary)' }}>
              {t('empty')}
            </p>
          ) : (
            <>
              {renderGroup(schools, 'school')}
              {renderGroup(bridges, 'bridge')}
              {renderGroup(waterTanks, 'water-tank')}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
