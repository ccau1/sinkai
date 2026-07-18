import type { Field, Tab } from 'payload'

export type LocaleSuffix = 'En' | 'ZhCN' | 'ZhTW'

export const localeTabLabels = {
  en: 'English',
  zhCN: '简体中文',
  zhTW: '繁體中文',
} as const

/**
 * Build a Payload `tabs` field with one tab per supported locale.
 * The caller provides a factory that returns the fields for a given locale suffix.
 */
export function createLocaleTabs(
  buildFields: (suffix: LocaleSuffix, label: string) => Field[],
): Field {
  const tabs: Tab[] = [
    { label: localeTabLabels.en, fields: buildFields('En', localeTabLabels.en) },
    { label: localeTabLabels.zhCN, fields: buildFields('ZhCN', localeTabLabels.zhCN) },
    { label: localeTabLabels.zhTW, fields: buildFields('ZhTW', localeTabLabels.zhTW) },
  ]

  return {
    type: 'tabs',
    tabs,
  }
}
