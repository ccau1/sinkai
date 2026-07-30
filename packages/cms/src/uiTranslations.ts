const uiStrings = {
  'collectionPreviews.heading': '集合',
  'collectionPreviews.noItems': '沒有項目',
  'collectionPreviews.viewAll': '查看全部',
  'collectionPreviews.createNewAria': '新增 {label}',
  'collectionPreviews.checking': '正在載入集合…',
  'collectionPreviews.error': '載入集合失敗：{message}',
  'eventsCalendar.prev': '← 上月',
  'eventsCalendar.today': '今天',
  'eventsCalendar.next': '下月 →',
  'eventsCalendar.more': '+{count} 更多',
  'eventsCalendar.untitledEvent': '活動 {id}',
  'installationCompletion.planning': '籌備中',
  'installationCompletion.upcoming': '即將開展',
  'installationCompletion.noteTitle': '狀態標識',
  'installationCompletion.noteIntro': '（顯示在管理列表和公開援助項目頁面）根據竣工日期判定：',
  'installationCompletion.noteEmpty': '留空日期 → 顯示為籌備中',
  'installationCompletion.noteFuture': '設定未來日期 → 顯示為即將開展',
  'installationCompletion.notePast': '設定過去日期 → 無標識（已完成）',
  'mediaUsage.heading': '用於 {count} 個文件',
  'mediaUsage.empty': '此媒體未被任何文件引用。',
  'mediaUsage.inlineContent': '（內聯內容）',
  'mediaUsage.checking': '正在載入引用…',
  'mediaUsage.inlineChecking': '正在掃描內聯圖片…',
  'mediaUsage.error': '載入引用失敗：{message}',
  'raisedSummary.title': '籌款進度',
  'raisedSummary.viewIn': '顯示幣種',
  'raisedSummary.noDonations': '此活動尚未收到任何捐款。',
  'raisedSummary.totalRaised': '已籌總額：',
  'raisedSummary.excluded': '（部分捐款無匯率，已排除）',
  'raisedSummary.raisedIn': '以 {currency} 計：',
  'raisedSummary.target': '目標：',
  'raisedSummary.funded': '已達成',
  'raisedSummary.ratesLive': '換算使用 open.er-api.com 的每日參考匯率{updatedAt}，以港元為 pivot 貨幣。',
  'raisedSummary.ratesStatic': '換算使用近似靜態備用匯率（即時匯率不可用），以港元為 pivot 貨幣。',
  'raisedSummary.updatedAt': '（更新於 {date}）',
  'videoThumbnail.heading': '影片縮圖',
  'videoThumbnail.checking': '正在檢查影片縮圖…',
  'videoThumbnail.generating': '正在生成影片縮圖…',
  'videoThumbnail.fresh': '影片縮圖已是最新。',
  'videoThumbnail.error': '影片縮圖錯誤：{message}',
  'videoThumbnail.default': '影片縮圖',
  'videoThumbnail.regenerate': '重新生成',
} as const

type TranslationKey = keyof typeof uiStrings

export function t(
  key: TranslationKey,
  _language?: string,
  interpolations?: Record<string, string | number>,
): string {
  let text: string = uiStrings[key]

  if (interpolations) {
    for (const [name, value] of Object.entries(interpolations)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }

  return text
}
