import { setRequestLocale } from 'next-intl/server';
import { fetchForms } from '@/lib/cms';
import { type Locale } from '@/i18n/config';
import FormsListContent from './FormsListContent';

export default async function FormsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const forms = await fetchForms(locale as Locale);

  return <FormsListContent forms={forms} />;
}
