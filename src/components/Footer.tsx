'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations();

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/gallery', label: t('nav.gallery') },
    { href: '/donate', label: t('nav.donate') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <footer style={{
      backgroundColor: 'var(--color-bg-surface)',
      borderTop: '1px solid var(--color-border)',
    }}>
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--color-primary-600)', color: 'var(--color-text-on-primary)' }}>
                善
              </span>
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Sin Kai
              </span>
            </div>
            <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {t('footer.description')}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {t('footer.nonProfit')}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-label mb-4" style={{ color: 'var(--color-primary-700)' }}>
              {t('footer.explore')}
            </h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={`/${locale}${link.href}`}
                    className="text-body-sm transition-colors duration-200"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary-600)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-label mb-4" style={{ color: 'var(--color-primary-700)' }}>
              {t('footer.contact')}
            </h4>
            <div className="space-y-2">
              <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {t('contact.address1')}<br />{t('contact.address2')}
              </p>
              <p className="text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                {t('contact.phoneLabel')}: {t('contact.phone')}<br />
                {t('contact.faxLabel')}: {t('contact.fax')}<br />
                {t('contact.emailLabel')}: {t('contact.email')}
              </p>
            </div>
          </div>

          {/* Donate */}
          <div>
            <h4 className="text-label mb-4" style={{ color: 'var(--color-primary-700)' }}>
              {t('footer.donate')}
            </h4>
            <div className="space-y-2">
              <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {t('donate.bankTransfer')}
              </p>
              <p className="text-sm font-mono" style={{ color: 'var(--color-primary-700)' }}>
                026-709-102666-21
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {t('donate.accountNote')}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            &copy; {new Date().getFullYear()} Sin Kai Charity Fund. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
