import type { Field, Tab } from 'payload'

export type LocaleSuffix = 'En' | 'ZhCN' | 'ZhTW'

export const localeTabLabels = {
  en: 'English',
  zhCN: '简体中文',
  zhTW: '繁體中文',
} as const

export type LocaleTabsOptions = {
  /**
   * Field base names that exist in every locale and should be copied from English
   * when the "Copy from English" button is clicked on a non-English tab.
   * Example: ['slugName', 'title', 'excerpt', 'content']
   */
  copyFromEnglish?: string[]
}

/**
 * Build a Payload `tabs` field with one tab per supported locale.
 * The caller provides a factory that returns the fields for a given locale suffix.
 */
export function createLocaleTabs(
  buildFields: (suffix: LocaleSuffix, label: string) => Field[],
  options: LocaleTabsOptions = {},
): Field {
  const { copyFromEnglish } = options
  const tabs: Tab[] = [
    { label: localeTabLabels.en, fields: buildFields('En', localeTabLabels.en) },
    { label: localeTabLabels.zhCN, fields: buildFields('ZhCN', localeTabLabels.zhCN) },
    { label: localeTabLabels.zhTW, fields: buildFields('ZhTW', localeTabLabels.zhTW) },
  ]

  if (copyFromEnglish && copyFromEnglish.length > 0) {
    for (let i = 1; i < tabs.length; i++) {
      const suffix = ['En', 'ZhCN', 'ZhTW'][i] as LocaleSuffix
      tabs[i].fields.unshift({
        name: `copyFromEnglish${suffix}`,
        type: 'ui',
        admin: {
          components: {
            Field: {
              path: './components/CopyFromEnglishButton#CopyFromEnglishButton',
              clientProps: {
                targetSuffix: suffix,
                fieldBases: copyFromEnglish,
              },
            },
          },
        },
      })
    }
  }

  return {
    type: 'tabs',
    tabs,
  }
}
