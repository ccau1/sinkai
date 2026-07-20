import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchNavigation, resolveNavItemHref, type CMSNavigation } from '@/lib/cms';
import '../globals.css';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'en' ? 'Sin Kai Funds Ltd' : '善啟慈善基金會',
    description: locale === 'en'
      ? 'Established in 1998, dedicated to education aid and school building in Guizhou\'s impoverished mountainous areas.'
      : '善啟慈善基金會成立於1998年，致力於中國貴州省貧困山區助學建校。零行政費，100%善款直達山區。',
  };
}

async function getFallbackNavigation(locale: Locale): Promise<CMSNavigation> {
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    items: [
      { label: t('about'), linkType: 'fixed', path: '/about', visible: true },
      { label: t('testimonies'), linkType: 'fixed', path: '/testimonies', visible: true },
      { label: t('installations'), linkType: 'fixed', path: '/installations', visible: true },
      { label: t('forms'), linkType: 'fixed', path: '/forms', visible: true },
      { label: t('blog'), linkType: 'fixed', path: '/blog', visible: true },
      { label: t('gallery'), linkType: 'fixed', path: '/gallery', visible: true },
      { label: t('donate'), linkType: 'fixed', path: '/donate', visible: true },
      { label: t('contact'), linkType: 'fixed', path: '/contact', visible: true },
    ],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const navigation = await fetchNavigation(locale as Locale);
  const effectiveNavigation =
    navigation?.items && navigation.items.length > 0
      ? navigation
      : await getFallbackNavigation(locale as Locale);

  const dynamicNavLinks = (effectiveNavigation.items || [])
    .map((item) => ({ label: item.label, href: resolveNavItemHref(item) }))
    .filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <html lang={locale} data-theme="light">
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <div className="flex flex-col min-h-[100dvh]">
              <Header dynamicNavLinks={dynamicNavLinks} />
              <main className="flex-1">{children}</main>
              <Footer dynamicNavLinks={dynamicNavLinks} />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
