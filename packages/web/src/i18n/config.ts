export type Locale = 'en' | 'zh-CN' | 'zh-TW';

export const locales: Locale[] = ['en', 'zh-CN', 'zh-TW'];
export const defaultLocale: Locale = 'zh-TW';

export const localeLabels: Record<Locale, string> = {
  'en': 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
};

export const localeFlags: Record<Locale, string> = {
  'en': '🇬🇧',
  'zh-CN': '🇨🇳',
  'zh-TW': '🇭🇰',
};
