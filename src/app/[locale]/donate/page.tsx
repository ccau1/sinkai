import { setRequestLocale } from 'next-intl/server';
import DonateContent from './DonateContent';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DonateContent />;
}
