'use client';

import CmsImage from '@/components/CmsImage';
import { useTranslations, useLocale, useFormatter } from 'next-intl';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { CMSInstallation, CMSInstallationType } from '@/lib/cms';
import { getInstallationTitle, getInstallationLocation, getInstallationDescription, getInstallationStatus, getMediaAlt } from '@/lib/cms';


interface InstallationGroup {
  type: CMSInstallationType;
  items: CMSInstallation[];
}

interface Props {
  groups: InstallationGroup[];
}

export default function InstallationsContent({ groups }: Props) {
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

  const renderGroup = (group: InstallationGroup) => {
    if (group.items.length === 0) return null;
    return (
      <div key={String(group.type.id)} className="mb-16">
        <h2 className="reveal text-title font-bold mb-8" style={{ color: 'var(--color-primary-700)' }}>
          {group.type.label}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {group.items.map((item) => {
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
                  {(() => {
                    const status = getInstallationStatus(item);
                    if (!status) return null;
                    return (
                      <span
                        className="inline-block self-start text-label font-semibold mb-2 px-2.5 py-0.5 rounded-full"
                        style={
                          status === 'upcoming'
                            ? { backgroundColor: 'var(--color-primary-600)', color: '#fff' }
                            : { backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
                        }
                      >
                        {t(status)}
                      </span>
                    );
                  })()}
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
          {groups.every((g) => g.items.length === 0) ? (
            <p className="text-center text-body" style={{ color: 'var(--color-text-secondary)' }}>
              {t('empty')}
            </p>
          ) : (
            groups.map(renderGroup)
          )}
        </div>
      </section>
    </div>
  );
}
