import type { Locale } from '../locales'

export interface InstallationTypeData {
  key: string
  sortOrder: number
  label: Record<Locale, string>
}

export const installationTypes: InstallationTypeData[] = [
  {
    key: 'school',
    sortOrder: 1,
    label: {
      en: 'School',
      'zh-CN': '学校',
      'zh-TW': '學校',
    },
  },
  {
    key: 'bridge',
    sortOrder: 2,
    label: {
      en: 'Bridge',
      'zh-CN': '桥梁',
      'zh-TW': '橋樑',
    },
  },
  {
    key: 'water-tank',
    sortOrder: 3,
    label: {
      en: 'Water Tank',
      'zh-CN': '水塔',
      'zh-TW': '水塔',
    },
  },
]
