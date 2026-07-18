import { blogPosts as localBlogPosts } from '@/data/blog'
import type { Locale } from '@/i18n/config'

export interface CMSMedia {
  id: number | string
  url?: string
  filename?: string
  altEn?: string
  altZhCN?: string
  altZhTW?: string
}

export interface CMSInstallation {
  id: number | string
  slug: string
  type: 'school' | 'bridge' | 'water-tank'
  titleEn: string
  titleZhCN: string
  titleZhTW: string
  locationEn: string
  locationZhCN: string
  locationZhTW: string
  completionDate?: string
  descriptionEn?: string
  descriptionZhCN?: string
  descriptionZhTW?: string
  photos?: CMSMedia[]
  published: boolean
}

export interface CMSBlog {
  id: number | string
  slugNameEn: string
  slugNameZhCN: string
  slugNameZhTW: string
  shortId: string
  titleEn: string
  titleZhCN: string
  titleZhTW: string
  excerptEn: string
  excerptZhCN: string
  excerptZhTW: string
  contentEn?: unknown
  contentZhCN?: unknown
  contentZhTW?: unknown
  legacyContentEn?: string
  legacyContentZhCN?: string
  legacyContentZhTW?: string
  coverImage?: CMSMedia
  date: string
  installations?: CMSInstallation[]
  published: boolean
}

function getCMSBaseUrl(): string | undefined {
  if (typeof process !== 'undefined' && process.env.CMS_API_URL) {
    return process.env.CMS_API_URL.replace(/\/$/, '')
  }
  return undefined
}

function resolveMediaUrl(url: string | undefined): string | undefined {
  if (!url) return url
  if (url.startsWith('http')) return url
  const base = getCMSBaseUrl()
  if (base && url.startsWith('/api/media/')) {
    return `${base}${url}`
  }
  return url
}

function normalizeMedia(media: CMSMedia | undefined): CMSMedia | undefined {
  if (!media) return media
  return {
    ...media,
    url: resolveMediaUrl(media.url) || media.filename,
  }
}

function normalizeLexicalContent(content: unknown): unknown {
  if (!content || typeof content !== 'object') return content
  if (Array.isArray(content)) {
    return content.map(normalizeLexicalContent)
  }
  const node = content as Record<string, unknown>
  if (node.type === 'upload' && node.value && typeof node.value === 'object') {
    return {
      ...node,
      value: normalizeMedia(node.value as CMSMedia),
    }
  }
  if (node.children && Array.isArray(node.children)) {
    return {
      ...node,
      children: node.children.map(normalizeLexicalContent),
    }
  }
  return content
}

function localeField<T>(doc: object, fieldBase: string, locale: Locale): T | undefined {
  const suffix = locale === 'zh-CN' ? 'ZhCN' : locale === 'zh-TW' ? 'ZhTW' : 'En'
  return ((doc as Record<string, unknown>)[`${fieldBase}${suffix}`] as T) || undefined
}

export function getBlogSlugName(doc: CMSBlog, locale: Locale): string {
  return localeField<string>(doc, 'slugName', locale) || doc.slugNameEn
}

export function getBlogTitle(doc: CMSBlog, locale: Locale): string {
  return localeField<string>(doc, 'title', locale) || doc.titleEn || ''
}

export function getBlogExcerpt(doc: CMSBlog, locale: Locale): string {
  return localeField<string>(doc, 'excerpt', locale) || doc.excerptEn || ''
}

export function getBlogContent(doc: CMSBlog, locale: Locale): unknown | string | undefined {
  return localeField<unknown>(doc, 'content', locale) || localeField<string>(doc, 'legacyContent', locale)
}

export function getInstallationTitle(doc: CMSInstallation, locale: Locale): string {
  return localeField<string>(doc, 'title', locale) || doc.titleEn || ''
}

export function getInstallationLocation(doc: CMSInstallation, locale: Locale): string {
  return localeField<string>(doc, 'location', locale) || doc.locationEn || ''
}

export function getInstallationDescription(doc: CMSInstallation, locale: Locale): string | undefined {
  return localeField<string>(doc, 'description', locale)
}

export function getMediaAlt(media: CMSMedia, locale: Locale): string {
  return localeField<string>(media, 'alt', locale) || media.altEn || ''
}

export async function fetchBlogs(locale: Locale): Promise<CMSBlog[]> {
  const base = getCMSBaseUrl()
  const fallback = () => localBlogPosts.map((post) => ({
    id: post.slug,
    slugNameEn: post.slug,
    slugNameZhCN: post.slug,
    slugNameZhTW: post.slug,
    shortId: generateShortId(post.slug),
    titleEn: post.translations.en.title,
    titleZhCN: post.translations['zh-CN'].title,
    titleZhTW: post.translations['zh-TW'].title,
    excerptEn: post.translations.en.excerpt,
    excerptZhCN: post.translations['zh-CN'].excerpt,
    excerptZhTW: post.translations['zh-TW'].excerpt,
    legacyContentEn: post.translations.en.content,
    legacyContentZhCN: post.translations['zh-CN'].content,
    legacyContentZhTW: post.translations['zh-TW'].content,
    coverImage: { id: post.coverImage, url: post.coverImage, altEn: post.translations.en.title },
    date: post.date,
    published: true,
  }))

  if (!base) {
    return fallback()
  }

  try {
    const res = await fetch(`${base}/api/blogs?where[published][equals]=true&limit=100&sort=-date`, { next: { revalidate: 60 } })
    if (!res.ok) {
      console.warn(`CMS blogs fetch failed: ${res.status}. Falling back to local data.`)
      return fallback()
    }
    const data = await res.json()
    const docs = ((data.docs || []) as CMSBlog[])
    if (docs.length === 0) {
      console.warn('CMS blogs returned empty. Falling back to local data.')
      return fallback()
    }
    return docs.map(normalizeBlog)
  } catch (err) {
    console.warn('CMS blogs fetch error:', err)
    return fallback()
  }
}

export async function fetchBlogBySlug(slug: string, shortId: string, locale: Locale): Promise<CMSBlog | null> {
  const base = getCMSBaseUrl()
  const fallback = () => {
    const local = localBlogPosts.find((p) => p.slug === slug)
    if (!local) return null
    return {
      id: local.slug,
      slugNameEn: local.slug,
      slugNameZhCN: local.slug,
      slugNameZhTW: local.slug,
      shortId: generateShortId(local.slug),
      titleEn: local.translations.en.title,
      titleZhCN: local.translations['zh-CN'].title,
      titleZhTW: local.translations['zh-TW'].title,
      excerptEn: local.translations.en.excerpt,
      excerptZhCN: local.translations['zh-CN'].excerpt,
      excerptZhTW: local.translations['zh-TW'].excerpt,
      legacyContentEn: local.translations.en.content,
      legacyContentZhCN: local.translations['zh-CN'].content,
      legacyContentZhTW: local.translations['zh-TW'].content,
      coverImage: { id: local.coverImage, url: local.coverImage, altEn: local.translations.en.title },
      date: local.date,
      published: true,
    }
  }

  if (!base) {
    return fallback()
  }

  const slugField = locale === 'zh-CN' ? 'slugNameZhCN' : locale === 'zh-TW' ? 'slugNameZhTW' : 'slugNameEn'
  try {
    const res = await fetch(
      `${base}/api/blogs?where[and][0][${slugField}][equals]=${encodeURIComponent(slug)}&where[and][1][shortId][equals]=${encodeURIComponent(shortId)}&depth=1`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) {
      console.warn(`CMS blog fetch failed: ${res.status}. Falling back to local data.`)
      return fallback()
    }
    const data = await res.json()
    const doc = data.docs?.[0]
    return doc ? normalizeBlog(doc) : null
  } catch (err) {
    console.warn('CMS blog fetch error:', err)
    return fallback()
  }
}

export async function fetchBlogForRedirect(slug: string, locale: Locale): Promise<{ slugName: string; shortId: string } | null> {
  const base = getCMSBaseUrl()
  const fallback = () => {
    const local = localBlogPosts.find((p) => p.slug === slug)
    if (!local) return null
    return { slugName: local.slug, shortId: generateShortId(local.slug) }
  }

  if (!base) {
    return fallback()
  }

  const slugField = locale === 'zh-CN' ? 'slugNameZhCN' : locale === 'zh-TW' ? 'slugNameZhTW' : 'slugNameEn'
  try {
    const res = await fetch(`${base}/api/blogs?where[${slugField}][equals]=${encodeURIComponent(slug)}`, { next: { revalidate: 60 } })
    if (!res.ok) {
      console.warn(`CMS redirect fetch failed: ${res.status}. Falling back to local data.`)
      return fallback()
    }
    const data = await res.json()
    const doc = data.docs?.[0]
    return doc ? { slugName: getBlogSlugName(doc, locale), shortId: doc.shortId } : null
  } catch (err) {
    console.warn('CMS redirect fetch error:', err)
    return fallback()
  }
}

export async function fetchInstallations(locale: Locale, type?: CMSInstallation['type']): Promise<CMSInstallation[]> {
  const base = getCMSBaseUrl()
  if (!base) return []

  let url = `${base}/api/installations?where[published][equals]=true&limit=100&sort=-completionDate`
  if (type) {
    url += `&where[type][equals]=${type}`
  }

  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) {
      console.warn(`CMS installations fetch failed: ${res.status}. Returning empty list.`)
      return []
    }
    const data = await res.json()
    return (data.docs || []).map(normalizeInstallation)
  } catch (err) {
    console.warn('CMS installations fetch error:', err)
    return []
  }
}

export async function fetchInstallationBySlug(slug: string, locale: Locale): Promise<CMSInstallation | null> {
  const base = getCMSBaseUrl()
  if (!base) return null

  try {
    const res = await fetch(`${base}/api/installations?where[slug][equals]=${encodeURIComponent(slug)}&depth=1`, { next: { revalidate: 60 } })
    if (!res.ok) {
      console.warn(`CMS installation fetch failed: ${res.status}.`)
      return null
    }
    const data = await res.json()
    const doc = data.docs?.[0]
    return doc ? normalizeInstallation(doc) : null
  } catch (err) {
    console.warn('CMS installation fetch error:', err)
    return null
  }
}

function normalizeBlog(doc: CMSBlog): CMSBlog {
  return {
    ...doc,
    contentEn: normalizeLexicalContent(doc.contentEn),
    contentZhCN: normalizeLexicalContent(doc.contentZhCN),
    contentZhTW: normalizeLexicalContent(doc.contentZhTW),
    coverImage: normalizeMedia(doc.coverImage),
    installations: (doc.installations || []).map(normalizeInstallation),
  }
}

function normalizeInstallation(doc: CMSInstallation): CMSInstallation {
  return {
    ...doc,
    photos: (doc.photos || []).map(normalizeMedia).filter(Boolean) as CMSMedia[],
  }
}

function generateShortId(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36).slice(0, 6).padEnd(6, '0')
}
