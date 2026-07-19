import { setRequestLocale } from 'next-intl/server';
import { fetchPageBySlug, getCMSBaseUrl } from '@/lib/cms';
import { type Locale } from '@/i18n/config';
import CMSPageContent from '@/components/CMSPageContent';
import ContactContent from './ContactContent';

interface FormsApiResponse {
  docs?: Array<{ id: string | number }>;
}

async function fetchContactFormId(): Promise<string | undefined> {
  const base = getCMSBaseUrl();
  if (!base) return undefined;

  try {
    const res = await fetch(
      `${base}/api/forms?where[title][equals]=Contact&limit=1&depth=0`,
      { cache: 'no-store' },
    );
    if (!res.ok) return undefined;

    const json = (await res.json()) as FormsApiResponse;
    const form = json.docs?.[0];
    return form ? String(form.id) : undefined;
  } catch {
    return undefined;
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, contactFormId] = await Promise.all([
    fetchPageBySlug('contact', locale as Locale),
    fetchContactFormId(),
  ]);

  if (page) {
    return <CMSPageContent page={page} />;
  }

  return <ContactContent formId={contactFormId} />;
}
