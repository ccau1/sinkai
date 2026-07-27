export type UiLanguage = 'en' | 'zh-CN' | 'zh-TW'

export function getUiLanguage(language?: string): UiLanguage {
  if (language === 'zh-CN' || language === 'zh-TW') return language
  return 'en'
}

const uiStrings = {
  'collectionPreviews.heading': {
    en: 'Collections',
    'zh-CN': '集合',
    'zh-TW': '集合',
  },
  'collectionPreviews.noItems': {
    en: 'No items',
    'zh-CN': '没有项目',
    'zh-TW': '沒有項目',
  },
  'collectionPreviews.viewAll': {
    en: 'View all',
    'zh-CN': '查看全部',
    'zh-TW': '查看全部',
  },
  'collectionPreviews.createNewAria': {
    en: 'Create new {label}',
    'zh-CN': '新建 {label}',
    'zh-TW': '新增 {label}',
  },
  'eventsCalendar.prev': {
    en: '← Prev',
    'zh-CN': '← 上月',
    'zh-TW': '← 上月',
  },
  'eventsCalendar.today': {
    en: 'Today',
    'zh-CN': '今天',
    'zh-TW': '今天',
  },
  'eventsCalendar.next': {
    en: 'Next →',
    'zh-CN': '下月 →',
    'zh-TW': '下月 →',
  },
  'eventsCalendar.more': {
    en: '+{count} more',
    'zh-CN': '+{count} 更多',
    'zh-TW': '+{count} 更多',
  },
  'eventsCalendar.untitledEvent': {
    en: 'Event {id}',
    'zh-CN': '活动 {id}',
    'zh-TW': '活動 {id}',
  },
  'installationCompletion.planning': {
    en: 'Planning',
    'zh-CN': '筹备中',
    'zh-TW': '籌備中',
  },
  'installationCompletion.upcoming': {
    en: 'Upcoming',
    'zh-CN': '即将开展',
    'zh-TW': '即將開展',
  },
  'installationCompletion.noteTitle': {
    en: 'Status badges',
    'zh-CN': '状态标识',
    'zh-TW': '狀態標識',
  },
  'installationCompletion.noteIntro': {
    en: '(shown in the admin list and on the public installations page) are derived from the completion date:',
    'zh-CN': '（显示在管理列表和公开援助项目页面）根据竣工日期判定：',
    'zh-TW': '（顯示在管理列表和公開援助項目頁面）根據竣工日期判定：',
  },
  'installationCompletion.noteEmpty': {
    en: 'Leave the date empty → shown as Planning',
    'zh-CN': '留空日期 → 显示为筹备中',
    'zh-TW': '留空日期 → 顯示為籌備中',
  },
  'installationCompletion.noteFuture': {
    en: 'Set a future date → shown as Upcoming',
    'zh-CN': '设定未来日期 → 显示为即将开展',
    'zh-TW': '設定未來日期 → 顯示為即將開展',
  },
  'installationCompletion.notePast': {
    en: 'Set a past date → no badge (completed)',
    'zh-CN': '设定过去日期 → 无标识（已完成）',
    'zh-TW': '設定過去日期 → 無標識（已完成）',
  },
  'mediaUsage.heading': {
    en: 'Used in {count} document{plural}',
    'zh-CN': '用于 {count} 个文档',
    'zh-TW': '用於 {count} 個文件',
  },
  'mediaUsage.empty': {
    en: 'This media is not referenced by any document.',
    'zh-CN': '此媒体未被任何文档引用。',
    'zh-TW': '此媒體未被任何文件引用。',
  },
  'mediaUsage.inlineContent': {
    en: '(inline content)',
    'zh-CN': '（内联内容）',
    'zh-TW': '（內聯內容）',
  },
  'raisedSummary.title': {
    en: 'Funding progress',
    'zh-CN': '筹款进度',
    'zh-TW': '籌款進度',
  },
  'raisedSummary.viewIn': {
    en: 'View in',
    'zh-CN': '显示币种',
    'zh-TW': '顯示幣種',
  },
  'raisedSummary.noDonations': {
    en: 'No donations allocated to this event yet.',
    'zh-CN': '此活动尚未收到任何捐款。',
    'zh-TW': '此活動尚未收到任何捐款。',
  },
  'raisedSummary.totalRaised': {
    en: 'Total raised:',
    'zh-CN': '已筹总额：',
    'zh-TW': '已籌總額：',
  },
  'raisedSummary.excluded': {
    en: '(some donations have no exchange rate and are excluded)',
    'zh-CN': '（部分捐款无汇率，已排除）',
    'zh-TW': '（部分捐款無匯率，已排除）',
  },
  'raisedSummary.raisedIn': {
    en: 'Raised in {currency}:',
    'zh-CN': '以 {currency} 计：',
    'zh-TW': '以 {currency} 計：',
  },
  'raisedSummary.target': {
    en: 'Target:',
    'zh-CN': '目标：',
    'zh-TW': '目標：',
  },
  'raisedSummary.funded': {
    en: 'funded',
    'zh-CN': '已达成',
    'zh-TW': '已達成',
  },
  'raisedSummary.ratesLive': {
    en: 'Conversions use daily reference rates from open.er-api.com{updatedAt}, via HKD as the pivot currency.',
    'zh-CN': '换算使用 open.er-api.com 的每日参考汇率{updatedAt}，以港元为 pivot 货币。',
    'zh-TW': '換算使用 open.er-api.com 的每日參考匯率{updatedAt}，以港元為 pivot 貨幣。',
  },
  'raisedSummary.ratesStatic': {
    en: 'Conversions use approximate static fallback rates (live rates unavailable), via HKD as the pivot currency.',
    'zh-CN': '换算使用近似静态备用汇率（实时汇率不可用），以港元为 pivot 货币。',
    'zh-TW': '換算使用近似靜態備用匯率（即時匯率不可用），以港元為 pivot 貨幣。',
  },
  'raisedSummary.updatedAt': {
    en: ' (updated {date})',
    'zh-CN': '（更新于 {date}）',
    'zh-TW': '（更新於 {date}）',
  },
  'videoThumbnail.heading': {
    en: 'Video Thumbnail',
    'zh-CN': '视频缩略图',
    'zh-TW': '影片縮圖',
  },
  'videoThumbnail.checking': {
    en: 'Checking video thumbnail…',
    'zh-CN': '正在检查视频缩略图…',
    'zh-TW': '正在檢查影片縮圖…',
  },
  'videoThumbnail.generating': {
    en: 'Generating video thumbnail…',
    'zh-CN': '正在生成视频缩略图…',
    'zh-TW': '正在生成影片縮圖…',
  },
  'videoThumbnail.fresh': {
    en: 'Video thumbnail is up to date.',
    'zh-CN': '视频缩略图已是最新。',
    'zh-TW': '影片縮圖已是最新。',
  },
  'videoThumbnail.error': {
    en: 'Video thumbnail error: {message}',
    'zh-CN': '视频缩略图错误：{message}',
    'zh-TW': '影片縮圖錯誤：{message}',
  },
  'videoThumbnail.default': {
    en: 'Video thumbnail',
    'zh-CN': '视频缩略图',
    'zh-TW': '影片縮圖',
  },
  'videoThumbnail.regenerate': {
    en: 'Regenerate',
    'zh-CN': '重新生成',
    'zh-TW': '重新生成',
  },
} as const

type TranslationKey = keyof typeof uiStrings

export function t(
  key: TranslationKey,
  language: string,
  interpolations?: Record<string, string | number>,
): string {
  const lang = getUiLanguage(language)
  const entry = uiStrings[key]
  let text: string = entry[lang] ?? entry.en

  if (interpolations) {
    for (const [name, value] of Object.entries(interpolations)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }

  return text
}
