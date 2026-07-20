import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { fetchForms, fetchFormById } from '@/lib/cms';
import { defaultLocale, locales, type Locale } from '@/i18n/config';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import FormRenderer from '@/components/FormRenderer';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateStaticParams() {
  const params: { locale: string; id: string }[] = [];
  for (const locale of locales) {
    const forms = await fetchForms(locale as Locale);
    for (const form of forms) {
      params.push({ locale, id: String(form.id) });
    }
  }

  // Static export requires at least one param for a dynamic route. If no
  // forms exist yet, generate a placeholder page so the build still succeeds.
  if (params.length === 0) {
    params.push({ locale: defaultLocale, id: 'new' });
  }

  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, id } = await params;
  const form = await fetchFormById(id, locale as Locale);
  return {
    title: form?.title || 'Form',
  };
}

export default async function FormPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'forms' });
  const form = await fetchFormById(id, locale as Locale);

  if (!form) {
    if (id === 'new') {
      return (
        <section className="section container-main">
          <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {t('formNotFound')}
          </p>
          <Link
            href={`/${locale}/forms/`}
            className="text-sm hover:underline"
            style={{ color: 'var(--color-primary-600)' }}
          >
            ← {t('backToForms')}
          </Link>
        </section>
      );
    }
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="container-main">
          <Link
            href={`/${locale}/forms/`}
            className="inline-block text-sm mb-4 hover:underline"
            style={{ color: 'var(--color-primary-600)' }}
          >
            ← {t('backToForms')}
          </Link>
          <h1 className="text-headline font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {form.title}
          </h1>
        </div>
      </section>

      {/* Form */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="container-main max-w-2xl">
          <FormRenderer form={form} />
        </div>
      </section>
    </div>
  );
}
