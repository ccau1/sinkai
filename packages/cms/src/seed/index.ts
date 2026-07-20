import fs from 'fs'
import path from 'path'

import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import { imageSize } from 'image-size'
import { blogPosts } from './blog-data'
import { testimonies } from './testimonies-data'
import { installations } from './installations-data'
import { gallerySections, type GalleryCategory } from './gallery-data'
import { generateShortId } from '../util/shortId'
import { locales, type Locale } from '../locales'
import { r2ObjectExists, r2UploadFile, getMimeType } from '../lib/r2Upload'

dotenvConfig({ path: '.env' })

const defaultLocale: Locale = 'zh-TW'

function shouldUploadToRemoteR2(): boolean {
  return (
    process.env.PAYLOAD_REMOTE === 'true' &&
    Boolean(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID)
  )
}

async function createMediaWithFileUpload(
  payload: import('payload').Payload,
  filePath: string,
  alt: Record<Locale, string>,
  extraData: Record<string, unknown> = {},
): Promise<{ id: number | string; existed: boolean }> {
  const filename = path.basename(filePath)
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0) {
    return { id: existing.docs[0].id, existed: true }
  }

  const created = await payload.create({
    collection: 'media',
    locale: defaultLocale,
    data: {
      alt: alt[defaultLocale],
      ...extraData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    filePath,
    overrideAccess: true,
  })

  for (const locale of locales.filter((l) => l !== defaultLocale)) {
    await payload.update({
      collection: 'media',
      id: created.id,
      locale,
      data: { alt: alt[locale] },
      overrideAccess: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  }

  return { id: created.id, existed: false }
}

async function createMediaWithRemoteR2(
  payload: import('payload').Payload,
  filePath: string,
  alt: Record<Locale, string>,
  extraData: Record<string, unknown> = {},
): Promise<{ id: number | string; existed: boolean }> {
  const filename = path.basename(filePath)
  const objectKey = `public/${filename}`

  // Reuse an existing non-private record with the same filename when possible.
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 100,
    overrideAccess: true,
  })

  const usable = existing.docs.find((doc: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prefix = (doc as any).prefix
    return prefix !== 'private'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any

  if (usable) {
    const exists = await r2ObjectExists(objectKey)
    if (!exists) {
      console.log(`Uploading missing R2 object for existing media: ${filename}`)
      await r2UploadFile(filePath, objectKey)
    }

    const updates: Record<string, unknown> = {}
    if (usable.prefix !== 'public') {
      updates.prefix = 'public'
    }

    if (Object.keys(updates).length > 0) {
      await payload.update({
        collection: 'media',
        id: usable.id as number | string,
        data: updates,
        overrideAccess: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    }

    return { id: usable.id as number | string, existed: true }
  }

  // No usable record exists: upload to R2 and create a new media document.
  console.log(`Uploading new R2 object: ${objectKey}`)
  const buffer = fs.readFileSync(filePath)
  await r2UploadFile(filePath, objectKey, buffer)

  const stats = fs.statSync(filePath)
  const dims = imageSize(buffer)
  const mimeType = getMimeType(filePath)

  const created = await payload.create({
    collection: 'media',
    locale: defaultLocale,
    data: {
      alt: alt[defaultLocale],
      filename,
      mimeType,
      filesize: stats.size,
      width: dims.width,
      height: dims.height,
      ...extraData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    overrideAccess: true,
  })

  for (const locale of locales.filter((l) => l !== defaultLocale)) {
    await payload.update({
      collection: 'media',
      id: created.id,
      locale,
      data: { alt: alt[locale] },
      overrideAccess: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  }

  return { id: created.id, existed: false }
}

async function findOrCreateMediaFromFile(
  payload: import('payload').Payload,
  filePath: string,
  alt: Record<Locale, string>,
  extraData: Record<string, unknown> = {},
): Promise<{ id: number | string; existed: boolean }> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  if (shouldUploadToRemoteR2()) {
    return createMediaWithRemoteR2(payload, filePath, alt, extraData)
  }

  return createMediaWithFileUpload(payload, filePath, alt, extraData)
}

const cwd = process.cwd()
const webPublicDir = path.resolve(cwd, '../web/public')

async function seed() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  // Ensure an admin user exists for local dev only
  if (process.env.NODE_ENV !== 'production') {
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@sinkai.org',
          username: 'admin',
          password: 'admin123',
          roles: ['admin'],
        },
      })
      console.log('Created default admin user: admin@sinkai.org / admin123 (username: admin)')
    } else {
      // Ensure the first user has admin privileges for local development.
      const firstUser = existingUsers.docs[0]
      const roles = (firstUser.roles as string[]) || []
      if (roles.length === 0) {
        await payload.update({
          collection: 'users',
          id: firstUser.id,
          data: {
            roles: ['admin'],
          },
        })
        console.log('Updated default user with admin role.')
      }
    }
  }

  let created = 0
  let updated = 0

  try {
    for (const post of blogPosts) {
      // Look up by the canonical default-locale slug rather than shortId.
      // shortId can gain collision suffixes or be mutated by older hooks, so
      // the slug is the stable natural key for idempotent seeding.
      const existing = await payload.find({
        collection: 'blogs',
        where: {
          'slugName.zh-TW': { equals: post.slug },
        },
        limit: 1,
      })

      // Create or reuse media for cover image.
      let coverImageId: number | string | undefined
      const coverPath = path.join(webPublicDir, post.coverImage)
      if (fs.existsSync(coverPath)) {
        const coverMedia = await findOrCreateMediaFromFile(payload, coverPath, {
          en: post.translations.en.title,
          'zh-CN': post.translations['zh-CN'].title,
          'zh-TW': post.translations['zh-TW'].title,
        })
        coverImageId = coverMedia.id
      } else {
        console.warn(`Cover image not found: ${coverPath}`)
      }

      if (existing.totalDocs > 0) {
        const existingDoc = existing.docs[0]

        // Ensure the shortId is set (older corrupted docs may be missing one).
        const updates: Record<string, unknown> = {}
        if (!existingDoc.shortId) {
          updates.shortId = generateShortId(post.slug)
        }
        if (coverImageId && coverImageId !== (existingDoc.coverImage as number | string)) {
          updates.coverImage = coverImageId as number
        }

        if (Object.keys(updates).length > 0) {
          await payload.update({
            collection: 'blogs',
            id: existingDoc.id,
            data: updates,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
        }

        // Refresh all locales in place instead of deleting and recreating.
        for (const locale of locales) {
          await payload.update({
            collection: 'blogs',
            id: existingDoc.id,
            locale,
            data: {
              slugName: post.slug,
              title: post.translations[locale].title,
              excerpt: post.translations[locale].excerpt,
              legacyContent: post.translations[locale].content,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
        }

        console.log(`Updated existing blog: ${post.slug}`)
        updated++
        continue
      }

      // Work around a Payload/D1 serialization issue when relationships are
      // combined with localized objects in a single create. Create the doc in
      // the default locale with the relationship, then update each remaining
      // locale separately.
      const shortId = generateShortId(post.slug)
      const createdDoc = await payload.create({
        collection: 'blogs',
        locale: 'zh-TW',
        data: {
          slugName: post.slug,
          title: post.translations['zh-TW'].title,
          excerpt: post.translations['zh-TW'].excerpt,
          legacyContent: post.translations['zh-TW'].content,
          shortId,
          coverImage: coverImageId as number,
          date: post.date,
          published: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })

      for (const locale of ['en', 'zh-CN'] as const) {
        await payload.update({
          collection: 'blogs',
          id: createdDoc.id,
          locale,
          data: {
            slugName: post.slug,
            title: post.translations[locale].title,
            excerpt: post.translations[locale].excerpt,
            legacyContent: post.translations[locale].content,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        })
      }

      console.log(`Created blog: ${post.slug}`)
      created++
    }
  } catch (err) {
    console.warn('Blog seeding encountered an error (the admin user is still available):', err)
  }

  await seedNavigation(payload)
  await seedTestimonies(payload)
  await seedInstallations(payload)
  await seedGallery(payload)

  console.log(`\nBlog seed complete: ${created} created, ${updated} updated`)
  process.exit(0)
}

interface NavItem {
  label: Record<Locale, string>
  linkType: 'fixed' | 'page' | 'external'
  path?: string
  url?: string
  page?: number
  visible: boolean
}

const defaultNavItems: NavItem[] = [
  {
    label: { en: 'About', 'zh-CN': '关于我们', 'zh-TW': '關於我們' },
    linkType: 'fixed',
    path: '/about',
    visible: true,
  },
  {
    label: { en: 'Testimonies', 'zh-CN': '见证分享', 'zh-TW': '見證分享' },
    linkType: 'fixed',
    path: '/testimonies',
    visible: true,
  },
  {
    label: { en: 'Installations', 'zh-CN': '援建项目', 'zh-TW': '援建項目' },
    linkType: 'fixed',
    path: '/installations',
    visible: true,
  },
  {
    label: { en: 'Blog', 'zh-CN': '博客', 'zh-TW': '博客' },
    linkType: 'fixed',
    path: '/blog',
    visible: true,
  },
  {
    label: { en: 'Gallery', 'zh-CN': '活动剪影', 'zh-TW': '活動剪影' },
    linkType: 'fixed',
    path: '/gallery',
    visible: true,
  },
  {
    label: { en: 'Donate', 'zh-CN': '捐款支持', 'zh-TW': '捐款支持' },
    linkType: 'fixed',
    path: '/donate',
    visible: true,
  },
  {
    label: { en: 'Contact', 'zh-CN': '联系我们', 'zh-TW': '聯繫我們' },
    linkType: 'fixed',
    path: '/contact',
    visible: true,
  },
]

async function seedNavigation(payload: import('payload').Payload) {
  const existing = await payload.findGlobal({
    slug: 'navigation',
  })

  const items = (existing.items as unknown as NavItem[] | undefined) || []

  // If navigation already has a testimonies link, leave it as-is.
  const hasTestimonies = items.some(
    (item) => item.linkType === 'fixed' && item.path === '/testimonies',
  )

  if (hasTestimonies) {
    console.log('Navigation already contains testimonies link.')
    return
  }

  // If navigation is empty, create the full default menu.
  if (items.length === 0) {
    await payload.updateGlobal({
      slug: 'navigation',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { items: defaultNavItems as unknown as any },
    })
    console.log('Created default navigation.')
    return
  }

  // Otherwise, insert testimonies right after the about link if present.
  const aboutIndex = items.findIndex(
    (item) => item.linkType === 'fixed' && item.path === '/about',
  )
  const testimoniesItem = defaultNavItems.find((item) => item.path === '/testimonies')!
  const newItems =
    aboutIndex >= 0
      ? [
          ...items.slice(0, aboutIndex + 1),
          testimoniesItem,
          ...items.slice(aboutIndex + 1),
        ]
      : [...items, testimoniesItem]

  await payload.updateGlobal({
    slug: 'navigation',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { items: newItems as unknown as any },
  })
  console.log('Inserted testimonies link into navigation.')
}

function textToLexical(text: string): unknown {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const children = paragraphs.map((paragraph) => ({
    type: 'paragraph' as const,
    direction: null as null,
    format: '' as const,
    indent: 0,
    version: 1,
    children: [
      {
        type: 'text' as const,
        text: paragraph,
        version: 1,
        format: 0,
        style: '' as const,
        mode: 'normal' as const,
        detail: 0,
      },
    ],
  }))

  return {
    root: {
      type: 'root' as const,
      direction: null as null,
      format: '' as const,
      indent: 0,
      version: 1,
      children,
    },
  }
}

async function seedTestimonies(payload: import('payload').Payload) {
  let created = 0
  let updated = 0
  let skipped = 0

  for (const testimony of testimonies) {
    const en = testimony.translations.en
    const existing = await payload.find({
      collection: 'testimonies',
      where: {
        'name.en': { equals: en.name },
      },
      limit: 1,
    })

    const photoIds: (number | string)[] = []
    for (const photoPath of testimony.photos) {
      const fullPath = path.join(webPublicDir, photoPath)
      if (!fs.existsSync(fullPath)) {
        console.warn(`Testimony photo not found: ${fullPath}`)
        continue
      }

      const media = await findOrCreateMediaFromFile(payload, fullPath, {
        en: en.name,
        'zh-CN': testimony.translations['zh-CN'].name,
        'zh-TW': testimony.translations['zh-TW'].name,
      })
      photoIds.push(media.id)
      console.log(`Prepared testimony photo: ${photoPath}`)
    }

    if (photoIds.length === 0) {
      console.warn(`No valid photos for testimony: ${en.name}. Skipping.`)
      skipped++
      continue
    }

    if (existing.totalDocs > 0) {
      const existingDoc = existing.docs[0]
      await payload.update({
        collection: 'testimonies',
        id: existingDoc.id,
        locale: 'en',
        data: {
          name: en.name,
          role: en.role,
          synopsis: en.synopsis,
          content: textToLexical(en.content),
          photos: photoIds as number[],
          highlighted: testimony.highlighted,
          published: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
      for (const locale of ['zh-CN', 'zh-TW'] as const) {
        const t = testimony.translations[locale]
        await payload.update({
          collection: 'testimonies',
          id: existingDoc.id,
          locale,
          data: {
            name: t.name,
            role: t.role,
            synopsis: t.synopsis,
            content: textToLexical(t.content),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        })
      }
      console.log(`Updated testimony: ${en.name}`)
      updated++
      continue
    }

    // Work around Payload/D1 serialization issue when hasMany relationships
    // are combined with localized objects in a single create. Create with the
    // default locale and photos, then update the remaining locales.
    const createdDoc = await payload.create({
      collection: 'testimonies',
      locale: 'en',
      data: {
        name: en.name,
        role: en.role,
        synopsis: en.synopsis,
        content: textToLexical(en.content),
        photos: photoIds as number[],
        highlighted: testimony.highlighted,
        published: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })

    for (const locale of ['zh-CN', 'zh-TW'] as const) {
      const t = testimony.translations[locale]
      await payload.update({
        collection: 'testimonies',
        id: createdDoc.id,
        locale,
        data: {
          name: t.name,
          role: t.role,
          synopsis: t.synopsis,
          content: textToLexical(t.content),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
    }

    console.log(`Created testimony: ${en.name}`)
    created++
  }

  console.log(`Testimonies seed complete: ${created} created, ${updated} updated, ${skipped} skipped`)
}

async function seedInstallations(payload: import('payload').Payload) {
  let created = 0
  let updated = 0
  const skipped = 0

  for (const installation of installations) {
    const en = installation.translations.en
    const existing = await payload.find({
      collection: 'installations',
      where: {
        slug: { equals: installation.slug },
      },
      limit: 1,
    })

    const photoIds: (number | string)[] = []
    for (const photoPath of installation.photos) {
      const fullPath = path.join(webPublicDir, photoPath)
      if (!fs.existsSync(fullPath)) {
        console.warn(`Installation photo not found: ${fullPath}`)
        continue
      }

      const media = await findOrCreateMediaFromFile(payload, fullPath, {
        en: en.title,
        'zh-CN': installation.translations['zh-CN'].title,
        'zh-TW': installation.translations['zh-TW'].title,
      })
      photoIds.push(media.id)
      console.log(`Prepared installation photo: ${photoPath}`)
    }

    if (photoIds.length === 0) {
      console.warn(`No valid photos for installation: ${en.title}. Skipping.`)
      continue
    }

    if (existing.totalDocs > 0) {
      const existingDoc = existing.docs[0]
      await payload.update({
        collection: 'installations',
        id: existingDoc.id,
        locale: 'en',
        data: {
          title: en.title,
          location: en.location,
          description: en.description,
          photos: photoIds as number[],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
      for (const locale of ['zh-CN', 'zh-TW'] as const) {
        const t = installation.translations[locale]
        await payload.update({
          collection: 'installations',
          id: existingDoc.id,
          locale,
          data: {
            title: t.title,
            location: t.location,
            description: t.description,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        })
      }
      console.log(`Updated installation: ${en.title}`)
      updated++
      continue
    }

    // Work around Payload/D1 serialization issue when hasMany relationships
    // are combined with localized objects in a single create. Create with the
    // default locale and photos, then update the remaining locales.
    const createdDoc = await payload.create({
      collection: 'installations',
      locale: 'en',
      data: {
        title: en.title,
        location: en.location,
        description: en.description,
        slug: installation.slug,
        type: installation.type,
        completionDate: installation.completionDate,
        photos: photoIds as number[],
        published: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })

    for (const locale of ['zh-CN', 'zh-TW'] as const) {
      const t = installation.translations[locale]
      await payload.update({
        collection: 'installations',
        id: createdDoc.id,
        locale,
        data: {
          title: t.title,
          location: t.location,
          description: t.description,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
    }

    console.log(`Created installation: ${en.title}`)
    created++
  }

  console.log(`Installations seed complete: ${created} created, ${updated} updated, ${skipped} skipped`)
}

async function seedGallery(payload: import('payload').Payload) {
  let created = 0
  let updated = 0
  let skipped = 0

  for (const section of gallerySections) {
    for (let i = 0; i < section.images.length; i++) {
      const imagePath = section.images[i]
      const fullPath = path.join(webPublicDir, imagePath)

      if (!fs.existsSync(fullPath)) {
        console.warn(`Gallery image not found: ${fullPath}`)
        skipped++
        continue
      }

      const media = await findOrCreateMediaFromFile(
        payload,
        fullPath,
        {
          en: `Gallery image: ${section.category}`,
          'zh-CN': `图库图片：${section.category}`,
          'zh-TW': `圖庫圖片：${section.category}`,
        },
        {
          category: section.category as GalleryCategory,
          sortOrder: i,
          hidden: false,
        },
      )

      if (media.existed) {
        const existingDoc = await payload.findByID({
          collection: 'media',
          id: media.id,
        })
        const needsUpdate =
          existingDoc.category !== section.category ||
          existingDoc.sortOrder !== i ||
          existingDoc.hidden !== false

        if (needsUpdate) {
          await payload.update({
            collection: 'media',
            id: media.id,
            data: {
              category: section.category as GalleryCategory,
              sortOrder: i,
              hidden: false,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
          })
          console.log(`Updated existing media for gallery: ${imagePath}`)
          updated++
        } else {
          skipped++
        }
      } else {
        console.log(`Created media for gallery: ${imagePath}`)
        created++
      }
    }
  }

  console.log(`Gallery seed complete: ${created} created, ${updated} updated, ${skipped} skipped`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
