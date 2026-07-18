import { setRequestLocale } from 'next-intl/server';
import ContactContent from './ContactContent';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent />;
}
