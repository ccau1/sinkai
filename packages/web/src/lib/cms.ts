import type { Locale } from '@/i18n/config'

export interface CMSMediaCategory {
  id: number | string
  slug: string
  label?: string
  title?: string
  description?: string
  sortOrder?: number
  showInGallery?: boolean
}

export interface CMSMedia {
  id: number | string
  url?: string
  filename?: string
  /** May be a localized object, a JSON-stringified object, or a plain string. */
  alt?: string | Record<string, string>
  category?: CMSMediaCategory | number | string
  tags?: string[]
  sortOrder?: number
  hidden?: boolean
}

export interface CMSInstallationType {
  id: number | string
  key: string
  label: string
  sortOrder?: number
}

export interface CMSInstallation {
  id: number | string
  slug: string
  type: number | CMSInstallationType
  title: string
  location: string
  completionDate?: string
  description?: string | Record<string, unknown>
  photos?: CMSMedia[]
  published: boolean
}

export interface CMSBlog {
  id: number | string
  slugName: string
  shortId: string
  title: string
  excerpt: string
  content?: unknown
  legacyContent?: string
  coverImage?: CMSMedia
  date: string
  installations?: CMSInstallation[]
  published: boolean
}

export interface CMSPage {
  id: number | string
  slug: string
  title: string
  excerpt?: string
  content?: unknown
  coverImage?: CMSMedia
  published: boolean
}

export interface CMSTestimony {
  id: number | string
  name: string
  role?: string
  highlighted: boolean
  photos?: CMSMedia[]
  synopsis: string
  content?: unknown
  published: boolean
}

export interface CMSNavItem {
  label: string
  linkType: 'page' | 'fixed' | 'external'
  page?: CMSPage | number | string
  path?: string
  url?: string
  visible: boolean
}

interface CMSNavItemRaw extends Omit<CMSNavItem, 'label'> {
  label: unknown
}

export interface CMSNavigation {
  items: CMSNavItem[]
}

export interface CMSMediaSection {
  category: CMSMediaCategory
  images: CMSMedia[]
}

export function getCMSBaseUrl(): string | undefined {
  if (typeof process !== 'undefined' && process.env.CMS_API_URL) {
    return process.env.CMS_API_URL.replace(/\/$/, '')
  }
  return undefined
}

function requireCMSBaseUrl(): string {
  const base = getCMSBaseUrl()
  if (!base) {
    throw new Error(
      'CMS_API_URL is not set. The web site is statically generated from the CMS, ' +
        'so the build requires a reachable CMS (e.g. CMS_API_URL=http://localhost:3001).',
    )
  }
  return base
}

async function cmsFetchJson<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) {
    throw new Error(`CMS fetch failed: ${res.status} ${res.statusText} for ${url}`)
  }
  return res.json() as Promise<T>
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

function normalizeMediaCategory(
  category: CMSMediaCategory | number | string | undefined,
  locale?: Locale,
): CMSMediaCategory | number | string | undefined {
  if (!category || typeof category !== 'object') return category
  return {
    ...category,
    label: locale ? resolveLocalizedField(category.label, locale, '') : category.label,
    title: locale ? resolveLocalizedField(category.title, locale, '') : category.title,
    description: locale
      ? resolveLocalizedField(category.description, locale, '')
      : category.description,
  }
}

function normalizeMedia(
  media: CMSMedia | undefined,
  locale?: Locale,
): CMSMedia | undefined {
  if (!media) return media
  return {
    ...media,
    url: resolveMediaUrl(media.url) || media.filename,
    alt: locale ? resolveLocalizedField(media.alt, locale, '') : media.alt,
    category: normalizeMediaCategory(media.category, locale),
  }
}

function normalizeLexicalContent(
  content: unknown,
  locale?: Locale,
): unknown {
  if (!content || typeof content !== 'object') return content
  if (Array.isArray(content)) {
    return content.map((item) => normalizeLexicalContent(item, locale))
  }
  const node = content as Record<string, unknown>
  if (node.type === 'upload' && node.value && typeof node.value === 'object') {
    return {
      ...node,
      value: normalizeMedia(node.value as CMSMedia, locale),
    }
  }
  if (node.children && Array.isArray(node.children)) {
    return {
      ...node,
      children: node.children.map((child) => normalizeLexicalContent(child, locale)),
    }
  }
  return content
}

// Legacy helpers — kept for call-site compatibility but now simply return the
// already-localized field that Payload returns when ?locale is set.
export function getBlogSlugName(doc: CMSBlog): string {
  return doc.slugName
}

export function getBlogTitle(doc: CMSBlog): string {
  return doc.title || ''
}

export function getBlogExcerpt(doc: CMSBlog): string {
  return doc.excerpt || ''
}

export function getBlogContent(doc: CMSBlog): unknown | string | undefined {
  return doc.content || doc.legacyContent
}

export function getInstallationTitle(doc: CMSInstallation): string {
  return doc.title || ''
}

export function getInstallationLocation(doc: CMSInstallation): string {
  return doc.location || ''
}

/** Collect all text nodes from a Lexical document tree. */
function collectLexicalText(node: unknown, out: string[]): void {
  if (!node || typeof node !== 'object') return
  const n = node as Record<string, unknown>
  if (typeof n.text === 'string') {
    out.push(n.text)
    return
  }
  if (Array.isArray(n.children)) {
    for (const child of n.children) collectLexicalText(child, out)
  }
}

/**
 * Installation descriptions are richText (Lexical) in the CMS. Older rows may
 * still hold a plain string — handle both and always return plain text.
 */
export function getInstallationDescription(doc: CMSInstallation): string | undefined {
  const description = doc.description
  if (!description) return undefined
  if (typeof description === 'string') return description

  const root = (description as Record<string, unknown>).root ?? description
  const parts: string[] = []
  collectLexicalText(root, parts)
  return parts.join(' ').trim() || undefined
}

/**
 * Derive the installation's progress status from its completion date:
 * - no completion date  -> 'planning'
 * - completion date in the future -> 'upcoming'
 * - otherwise (past date) -> null (completed, no badge)
 */
export function getInstallationStatus(doc: CMSInstallation): 'planning' | 'upcoming' | null {
  if (!doc.completionDate) return 'planning'
  return new Date(doc.completionDate) > new Date() ? 'upcoming' : null
}

export function getMediaAlt(media: CMSMedia, locale?: Locale | string): string {
  if (!media.alt) return ''
  if (locale) {
    return resolveLocalizedField(media.alt, locale as Locale, '')
  }
  if (typeof media.alt === 'string') return media.alt
  return ''
}

function localeQuery(locale: Locale): string {
  return `locale=${encodeURIComponent(locale)}`
}

function isValidBlogDoc(doc: CMSBlog): boolean {
  return Boolean(doc && typeof doc.slugName === 'string' && doc.slugName && doc.shortId)
}

export async function fetchBlogs(locale: Locale): Promise<CMSBlog[]> {
  const base = requireCMSBaseUrl()
  const data = await cmsFetchJson<{ docs: CMSBlog[] }>(
    `${base}/api/blogs?where[published][equals]=true&limit=100&sort=-date&${localeQuery(locale)}`,
  )
  const docs = data.docs || []
  const validDocs = docs.filter(isValidBlogDoc)
  if (validDocs.length !== docs.length) {
    console.warn(
      `CMS blogs returned ${docs.length - validDocs.length} invalid doc(s) (missing slugName/shortId). Excluding them.`,
    )
  }
  // Defensive deduplication: the CMS may contain multiple docs for the same
  // logical post (e.g. from earlier seed/hook instability). Duplicates created
  // by the old shortId logic have different shortIds but the same slugName, so
  // we dedupe by slugName and keep the first occurrence.
  const uniqueDocs = Array.from(
    new Map(validDocs.map((doc) => [doc.slugName, doc])).values(),
  )
  if (uniqueDocs.length !== validDocs.length) {
    console.warn(
      `CMS blogs contained ${validDocs.length - uniqueDocs.length} duplicate slug(s). Rendering unique posts only.`,
    )
  }
  return uniqueDocs.map((doc) => normalizeBlog(doc, locale))
}

export async function fetchBlogBySlug(
  slug: string,
  shortId: string,
  locale: Locale,
): Promise<CMSBlog | null> {
  const base = requireCMSBaseUrl()
  const data = await cmsFetchJson<{ docs: CMSBlog[] }>(
    `${base}/api/blogs?where[and][0][slugName][equals]=${encodeURIComponent(slug)}&where[and][1][shortId][equals]=${encodeURIComponent(shortId)}&depth=1&${localeQuery(locale)}`,
  )
  const doc = data.docs?.[0]
  return doc ? normalizeBlog(doc, locale) : null
}

export async function fetchBlogForRedirect(
  slug: string,
  locale: Locale,
): Promise<{ slugName: string; shortId: string } | null> {
  const base = requireCMSBaseUrl()
  const data = await cmsFetchJson<{ docs: Array<{ slugName: string; shortId: string }> }>(
    `${base}/api/blogs?where[slugName][equals]=${encodeURIComponent(slug)}&${localeQuery(locale)}`,
  )
  const doc = data.docs?.[0]
  return doc ? { slugName: doc.slugName, shortId: doc.shortId } : null
}

export async function fetchInstallationTypes(locale: Locale): Promise<CMSInstallationType[]> {
  const base = getCMSBaseUrl()
  if (!base) return []

  try {
    const res = await fetch(
      `${base}/api/installation-types?limit=100&sort=sortOrder&${localeQuery(locale)}`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) {
      console.warn(`CMS installation types fetch failed: ${res.status}. Returning empty list.`)
      return []
    }
    const data = (await res.json()) as { docs?: CMSInstallationType[] }
    return data.docs || []
  } catch (err) {
    console.warn('CMS installation types fetch error:', err)
    return []
  }
}

export async function fetchInstallations(
  locale: Locale,
  typeId?: number | string,
): Promise<CMSInstallation[]> {
  const base = getCMSBaseUrl()
  if (!base) return []

  let url = `${base}/api/installations?where[published][equals]=true&limit=100&sort=-completionDate&${localeQuery(locale)}`
  if (typeId) {
    url += `&where[type][equals]=${typeId}`
  }

  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) {
      console.warn(`CMS installations fetch failed: ${res.status}. Returning empty list.`)
      return []
    }
    const data = (await res.json()) as { docs?: CMSInstallation[] }
    return (data.docs || []).map((doc) => normalizeInstallation(doc, locale))
  } catch (err) {
    console.warn('CMS installations fetch error:', err)
    return []
  }
}

export async function fetchInstallationBySlug(
  slug: string,
  locale: Locale,
): Promise<CMSInstallation | null> {
  const base = getCMSBaseUrl()
  if (!base) return null

  try {
    const res = await fetch(
      `${base}/api/installations?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&${localeQuery(locale)}`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) {
      console.warn(`CMS installation fetch failed: ${res.status}.`)
      return null
    }
    const data = await res.json()
    const doc = data.docs?.[0]
    return doc ? normalizeInstallation(doc, locale) : null
  } catch (err) {
    console.warn('CMS installation fetch error:', err)
    return null
  }
}

export async function fetchPageBySlug(
  slug: string,
  locale: Locale,
): Promise<CMSPage | null> {
  const base = getCMSBaseUrl()
  if (!base) return null

  try {
    const res = await fetch(
      `${base}/api/pages?where[and][0][slug][equals]=${encodeURIComponent(slug)}&where[and][1][published][equals]=true&depth=1&${localeQuery(locale)}`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) {
      console.warn(`CMS page fetch failed: ${res.status}.`)
      return null
    }
    const data = await res.json()
    const doc = data.docs?.[0]
    return doc ? normalizePage(doc, locale) : null
  } catch (err) {
    console.warn('CMS page fetch error:', err)
    return null
  }
}

export async function fetchTestimonies(
  locale: Locale,
  options?: { highlightedOnly?: boolean },
): Promise<CMSTestimony[]> {
  const base = getCMSBaseUrl()
  if (!base) return []

  let url = `${base}/api/testimonies?where[published][equals]=true&limit=100&sort=-updatedAt&${localeQuery(locale)}`
  if (options?.highlightedOnly) {
    url += `&where[highlighted][equals]=true`
  }

  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) {
      console.warn(`CMS testimonies fetch failed: ${res.status}. Returning empty list.`)
      return []
    }
    const data = (await res.json()) as { docs?: CMSTestimony[] }
    return (data.docs || []).map((doc) => normalizeTestimony(doc, locale))
  } catch (err) {
    console.warn('CMS testimonies fetch error:', err)
    return []
  }
}

export async function fetchGalleryMedia(locale: Locale): Promise<CMSMediaSection[]> {
  const base = getCMSBaseUrl()
  if (!base) return []

  try {
    const res = await fetch(
      `${base}/api/media?where[and][0][hidden][not_equals]=true&where[and][1][category][exists]=true&limit=300&sort=sortOrder&depth=1&${localeQuery(locale)}`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) {
      console.warn(`CMS gallery fetch failed: ${res.status}. Returning empty list.`)
      return []
    }
    const data = await res.json()
    const docs = (data.docs || []) as CMSMedia[]

    const grouped = new Map<number | string, CMSMediaSection>()
    for (const doc of docs) {
      const normalized = normalizeMedia(doc, locale)
      if (!normalized) continue
      const category = normalized.category
      if (!category || typeof category !== 'object') continue
      if (category.showInGallery === false) continue

      const existing = grouped.get(category.id)
      if (existing) {
        existing.images.push(normalized)
      } else {
        grouped.set(category.id, { category, images: [normalized] })
      }
    }

    const sections = Array.from(grouped.values()).sort(
      (a, b) => (a.category.sortOrder ?? 0) - (b.category.sortOrder ?? 0),
    )

    if (sections.length === 0) {
      console.warn(
        `fetchGalleryMedia returned 0 sections (${docs.length} media docs fetched, locale=${locale}).`,
      )
    }

    return sections
  } catch (err) {
    console.warn('CMS gallery fetch error:', err)
    return []
  }
}

export async function fetchNavigation(locale: Locale): Promise<CMSNavigation | null> {
  const base = getCMSBaseUrl()
  if (!base) return null

  try {
    const res = await fetch(
      `${base}/api/globals/navigation?depth=1&${localeQuery(locale)}`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) {
      console.warn(`CMS navigation fetch failed: ${res.status}.`)
      return null
    }
    const data = await res.json()
    return normalizeNavigation(data, locale)
  } catch (err) {
    console.warn('CMS navigation fetch error:', err)
    return null
  }
}

export function resolveNavItemHref(
  item: CMSNavItem,
): string | undefined {
  if (!item.visible) return undefined
  if (item.linkType === 'external') return item.url
  if (item.linkType === 'fixed') return item.path || '/'
  if (item.linkType === 'page' && item.page && typeof item.page === 'object') {
    return `/${item.page.slug}/`
  }
  return undefined
}

function normalizeBlog(doc: CMSBlog, locale: Locale): CMSBlog {
  return {
    ...doc,
    content: normalizeLexicalContent(doc.content, locale),
    coverImage: normalizeMedia(doc.coverImage, locale),
    installations: (doc.installations || []).map((installation) =>
      normalizeInstallation(installation, locale),
    ),
  }
}

function normalizeInstallation(
  doc: CMSInstallation,
  locale: Locale,
): CMSInstallation {
  return {
    ...doc,
    photos: (doc.photos || [])
      .map((photo) => normalizeMedia(photo, locale))
      .filter(Boolean) as CMSMedia[],
  }
}

function normalizePage(doc: CMSPage, locale: Locale): CMSPage {
  return {
    ...doc,
    content: normalizeLexicalContent(doc.content, locale),
    coverImage: normalizeMedia(doc.coverImage, locale),
  }
}

function normalizeTestimony(doc: CMSTestimony, locale: Locale): CMSTestimony {
  return {
    ...doc,
    content: normalizeLexicalContent(doc.content, locale),
    photos: (doc.photos || [])
      .map((photo) => normalizeMedia(photo, locale))
      .filter(Boolean) as CMSMedia[],
  }
}

export function resolveLocalizedField(
  value: unknown,
  locale: Locale,
  fallback = '',
): string {
  if (typeof value === 'string') {
    // Defensive: some CMS responses may return a localized object as a JSON string.
    const trimmed = value.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return resolveLocalizedField(parsed, locale, fallback)
        }
      } catch {
        // Not a JSON object; treat it as a plain label string.
      }
    }
    return value
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const map = value as Record<string, string>
    if (map[locale]) return map[locale]
    if (map.en) return map.en
    const first = Object.values(map).find((v) => typeof v === 'string')
    return first || fallback
  }
  return fallback
}

function normalizeNavigation(
  data: unknown,
  locale: Locale,
): CMSNavigation {
  const nav = (data || {}) as { items?: CMSNavItemRaw[] }
  return {
    items: (nav.items || [])
      .map((item) => {
        const { label, ...rest } = item
        return {
          ...rest,
          label: resolveLocalizedField(label, locale),
          page:
            item.page && typeof item.page === 'object'
              ? normalizePage(item.page as CMSPage, locale)
              : item.page,
        }
      })
      .filter((item) => item.visible !== false),
  }
}

// ---------------------------------------------------------------------------
// Forms (via Payload Form Builder plugin)
// ---------------------------------------------------------------------------

export interface CMSFormBaseField {
  id?: string | null
  blockName?: string | null
}

export interface CMSFormCheckboxField extends CMSFormBaseField {
  blockType: 'checkbox'
  name: string
  label?: string | null
  width?: number | null
  required?: boolean | null
  defaultValue?: boolean | null
}

export interface CMSFormCountryField extends CMSFormBaseField {
  blockType: 'country'
  name: string
  label?: string | null
  width?: number | null
  required?: boolean | null
}

export interface CMSFormEmailField extends CMSFormBaseField {
  blockType: 'email'
  name: string
  label?: string | null
  width?: number | null
  required?: boolean | null
}

export interface CMSFormMessageField extends CMSFormBaseField {
  blockType: 'message'
  message?: unknown | null
}

export interface CMSFormNumberField extends CMSFormBaseField {
  blockType: 'number'
  name: string
  label?: string | null
  width?: number | null
  defaultValue?: number | null
  required?: boolean | null
}

export interface CMSFormSelectOption {
  label: string
  value: string
  id?: string | null
}

export interface CMSFormSelectField extends CMSFormBaseField {
  blockType: 'select'
  name: string
  label?: string | null
  width?: number | null
  defaultValue?: string | null
  placeholder?: string | null
  options?: CMSFormSelectOption[] | null
  required?: boolean | null
}

export interface CMSFormStateField extends CMSFormBaseField {
  blockType: 'state'
  name: string
  label?: string | null
  width?: number | null
  required?: boolean | null
}

export interface CMSFormTextField extends CMSFormBaseField {
  blockType: 'text'
  name: string
  label?: string | null
  width?: number | null
  defaultValue?: string | null
  required?: boolean | null
}

export interface CMSFormTextareaField extends CMSFormBaseField {
  blockType: 'textarea'
  name: string
  label?: string | null
  width?: number | null
  defaultValue?: string | null
  required?: boolean | null
}

export interface CMSFormUploadMimeType {
  mimeType: string
}

export interface CMSFormUploadField extends CMSFormBaseField {
  blockType: 'upload'
  name: string
  label?: string | null
  width?: number | null
  required?: boolean | null
  multiple?: boolean | null
  uploadCollection: string
  mimeTypes?: CMSFormUploadMimeType[] | null
  maxFileSize?: number | null
}

export type CMSFormField =
  | CMSFormCheckboxField
  | CMSFormCountryField
  | CMSFormEmailField
  | CMSFormMessageField
  | CMSFormNumberField
  | CMSFormSelectField
  | CMSFormStateField
  | CMSFormTextField
  | CMSFormTextareaField
  | CMSFormUploadField

export interface CMSForm {
  id: number | string
  title: string
  fields?: CMSFormField[] | null
  submitButtonLabel?: string | null
  confirmationType?: ('message' | 'redirect') | null
  confirmationMessage?: unknown | null
  redirect?: {
    url: string
  } | null
}

function normalizeForm(form: CMSForm, locale: Locale): CMSForm {
  const normalizeField = (field: CMSFormField): CMSFormField => {
    switch (field.blockType) {
      case 'select':
        return {
          ...field,
          label: resolveLocalizedField(field.label, locale),
          options: (field.options || []).map((option) => ({
            ...option,
            label: resolveLocalizedField(option.label, locale),
          })),
        }
      case 'message':
        return field
      default:
        return {
          ...field,
          label: resolveLocalizedField(field.label, locale),
        }
    }
  }

  return {
    ...form,
    submitButtonLabel: resolveLocalizedField(form.submitButtonLabel, locale),
    fields: (form.fields || []).map(normalizeField),
  }
}

export async function fetchForms(locale: Locale): Promise<CMSForm[]> {
  const base = getCMSBaseUrl()
  if (!base) return []

  try {
    const res = await fetch(
      `${base}/api/forms?limit=100&depth=0&${localeQuery(locale)}`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) {
      console.warn(`CMS forms fetch failed: ${res.status}. Returning empty list.`)
      return []
    }
    const data = (await res.json()) as { docs?: CMSForm[] }
    return (data.docs || []).map((form) => normalizeForm(form, locale))
  } catch (err) {
    console.warn('CMS forms fetch error:', err)
    return []
  }
}

export async function fetchFormById(
  id: number | string,
  locale: Locale,
): Promise<CMSForm | null> {
  const base = getCMSBaseUrl()
  if (!base) return null

  try {
    const res = await fetch(
      `${base}/api/forms/${encodeURIComponent(String(id))}?depth=0&${localeQuery(locale)}`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) {
      console.warn(`CMS form fetch failed: ${res.status}.`)
      return null
    }
    const form = (await res.json()) as CMSForm
    return normalizeForm(form, locale)
  } catch (err) {
    console.warn('CMS form fetch error:', err)
    return null
  }
}

export async function fetchFormByTitle(
  title: string,
  locale: Locale,
): Promise<CMSForm | null> {
  const base = getCMSBaseUrl()
  if (!base) return null

  try {
    const res = await fetch(
      `${base}/api/forms?where[title][equals]=${encodeURIComponent(title)}&limit=1&depth=0&${localeQuery(locale)}`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) {
      console.warn(`CMS form fetch failed: ${res.status}.`)
      return null
    }
    const data = (await res.json()) as { docs?: CMSForm[] }
    const form = data.docs?.[0]
    return form ? normalizeForm(form, locale) : null
  } catch (err) {
    console.warn('CMS form fetch error:', err)
    return null
  }
}
