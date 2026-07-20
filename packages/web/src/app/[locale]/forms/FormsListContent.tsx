'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import type { CMSForm } from '@/lib/cms';

interface Props {
  forms: CMSForm[];
}

export default function FormsListContent({ forms }: Props) {
  const t = useTranslations('forms');
  const locale = useLocale();
  const [copiedId, setCopiedId] = useState<number | string | null>(null);

  const copyLink = async (id: number | string) => {
    const url = `${window.location.origin}/${locale}/forms/${id}/`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: do nothing if clipboard is unavailable.
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main text-center">
          <p className="text-label mb-3" style={{ color: 'var(--color-primary-600)' }}>
            SIN KAI FORMS
          </p>
          <h1 className="text-headline font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {t('pageTitle')}
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            {t('pageSubtitle')}
          </p>
        </div>
      </section>

      {/* List */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main">
          {forms.length === 0 ? (
            <p className="text-center text-body" style={{ color: 'var(--color-text-secondary)' }}>
              {t('noForms')}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <article
                  key={form.id}
                  className="rounded-xl p-6 flex flex-col justify-between transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <h3
                      className="font-semibold text-base mb-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {form.title}
                    </h3>
                    <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      {t('formIdLabel', { id: String(form.id) })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/${locale}/forms/${form.id}/`}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      {t('openForm')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => copyLink(form.id)}
                      className="text-sm px-4 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg-base)',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {copiedId === form.id ? t('copied') : t('copyLink')}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
