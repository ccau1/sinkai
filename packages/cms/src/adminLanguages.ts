import { en } from '@payloadcms/translations/languages/en'
import { zh } from '@payloadcms/translations/languages/zh'
import { zhTw } from '@payloadcms/translations/languages/zhTw'

export type AdminLanguage = 'en' | 'zh-CN' | 'zh-TW'

export const defaultAdminLanguage = 'zh-TW' as const

export const adminLanguageLabels: Record<AdminLanguage, string> = {
  en: 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
}

export const adminLanguageFieldLabel = {
  en: 'Admin Interface Language',
  'zh-CN': '管理界面语言',
  'zh-TW': '管理介面語言',
}

export const adminLanguageFieldDescription = {
  en: 'The language used for CMS menus, buttons, and labels.',
  'zh-CN': '用于 CMS 菜单、按钮和标签的语言。',
  'zh-TW': '用於 CMS 選單、按鈕和標籤的語言。',
}

export const userPreferencesMenuLabel = {
  en: 'User Preferences',
  'zh-CN': '用户偏好设置',
  'zh-TW': '使用者偏好设定',
}

export const supportedAdminLanguageOptions = Object.entries(adminLanguageLabels).map(
  ([value, label]) => ({
    label,
    value,
  }),
)

export const supportedAdminLanguages = {
  en,
  'zh-CN': zh,
  'zh-TW': zhTw,
}
