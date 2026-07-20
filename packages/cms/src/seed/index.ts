import fs from 'fs'
import path from 'path'

import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import { blogPosts } from './blog-data'
import { testimonies } from './testimonies-data'
import { installations } from './installations-data'
import { gallerySections, type GalleryCategory } from './gallery-data'
import { generateShortId } from '../util/shortId'
import { locales, type Locale } from '../locales'

dotenvConfig({ path: '.env' })

const defaultLocale: Locale = 'zh-TW'

async function createLocalizedMedia(
  payload: import('payload').Payload,
  filePath: string,
  alt: Record<Locale, string>,
  extraData: Record<string, unknown> = {},
): Promise<{ id: number | string }> {
  // Work around a Payload/D1 serialization issue: creating a media doc with a
  // localized object for `alt` in a single call can store it as a JSON string.
  // Create the default locale first, then update the remaining locales.
  const created = await payload.create({
    collection: 'media',
    data: {
      alt: alt[defaultLocale],
      ...extraData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    filePath,
  })

  for (const locale of ['en', 'zh-CN'] as const) {
    await payload.update({
      collection: 'media',
      id: created.id,
      locale,
      data: { alt: alt[locale] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  }

  return created
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
          password: 'admin123',
          roles: ['admin'],
        },
      })
      console.log('Created default admin user: admin@sinkai.org / admin123')
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
  let skipped = 0

  try {
    for (const post of blogPosts) {
      const shortId = generateShortId(post.slug)
      const existing = await payload.find({
        collection: 'blogs',
        where: {
          shortId: { equals: shortId },
        },
        limit: 1,
      })

      if (existing.totalDocs > 0) {
        const existingDoc = existing.docs[0]
        const fullDoc = await payload.findByID({
          collection: 'blogs',
          id: existingDoc.id,
          locale: 'all',
        })
        const slugName = (fullDoc.slugName || {}) as Record<string, string>
        const hasAllLocales = locales.every((locale) => Boolean(slugName[locale]))
        if (hasAllLocales) {
          console.log(`Skipping existing blog: ${post.slug}`)
          skipped++
          continue
        }
        // Localized fields were lost (Payload/D1 serialization bug). Delete and
        // recreate the doc rather than trying to repair corrupted locale rows.
        await payload.delete({
          collection: 'blogs',
          id: existingDoc.id,
        })
        console.log(`Deleted corrupted blog for re-creation: ${post.slug}`)
      }

      // Create or reuse media for cover image.
      let coverImageId: number | string | undefined
      const coverPath = path.join(webPublicDir, post.coverImage)
      if (fs.existsSync(coverPath)) {
        const coverFilename = path.basename(post.coverImage)
        const existingMedia = await payload.find({
          collection: 'media',
          where: { filename: { equals: coverFilename } },
          limit: 1,
        })

        if (existingMedia.totalDocs > 0) {
          coverImageId = existingMedia.docs[0].id
          console.log(`Reusing existing media for cover: ${coverFilename}`)
        } else {
          const media = await createLocalizedMedia(payload, coverPath, {
            en: post.translations.en.title,
            'zh-CN': post.translations['zh-CN'].title,
            'zh-TW': post.translations['zh-TW'].title,
          })
          coverImageId = media.id
          console.log(`Created media for cover: ${post.coverImage}`)
        }
      } else {
        console.warn(`Cover image not found: ${coverPath}`)
      }

      // Work around a Payload/D1 serialization issue when relationships are
      // combined with localized objects in a single create. Create the doc in
      // the default locale with the relationship, then update each remaining
      // locale separately.
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

  console.log(`\nSeed complete: ${created} created, ${skipped} skipped`)
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

    if (existing.totalDocs > 0) {
      console.log(`Skipping existing testimony: ${en.name}`)
      skipped++
      continue
    }

    const photoIds: (number | string)[] = []
    for (const photoPath of testimony.photos) {
      const fullPath = path.join(webPublicDir, photoPath)
      if (!fs.existsSync(fullPath)) {
        console.warn(`Testimony photo not found: ${fullPath}`)
        continue
      }

      const media = await createLocalizedMedia(payload, fullPath, {
        en: en.name,
        'zh-CN': testimony.translations['zh-CN'].name,
        'zh-TW': testimony.translations['zh-TW'].name,
      })
      photoIds.push(media.id)
      console.log(`Created media for testimony photo: ${photoPath}`)
    }

    if (photoIds.length === 0) {
      console.warn(`No valid photos for testimony: ${en.name}. Skipping.`)
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

  console.log(`Testimonies seed complete: ${created} created, ${skipped} skipped`)
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
        'slug': { equals: installation.slug },
      },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      // Update existing installation with plain-text descriptions in case it
      // was previously seeded with Lexical objects.
      const existingDoc = existing.docs[0]
      await payload.update({
        collection: 'installations',
        id: existingDoc.id,
        locale: 'en',
        data: {
          title: en.title,
          location: en.location,
          description: en.description,
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
      console.log(`Updated existing installation: ${en.title}`)
      updated++
      continue
    }

    const photoIds: (number | string)[] = []
    for (const photoPath of installation.photos) {
      const fullPath = path.join(webPublicDir, photoPath)
      if (!fs.existsSync(fullPath)) {
        console.warn(`Installation photo not found: ${fullPath}`)
        continue
      }

      const media = await createLocalizedMedia(payload, fullPath, {
        en: en.title,
        'zh-CN': installation.translations['zh-CN'].title,
        'zh-TW': installation.translations['zh-TW'].title,
      })
      photoIds.push(media.id)
      console.log(`Created media for installation photo: ${photoPath}`)
    }

    if (photoIds.length === 0) {
      console.warn(`No valid photos for installation: ${en.title}. Skipping.`)
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

      const filename = path.basename(imagePath)

      // Try to find an existing media record with the same filename to avoid
      // uploading the same gallery image twice.
      const existing = await payload.find({
        collection: 'media',
        where: {
          filename: { equals: filename },
        },
        limit: 1,
      })

      if (existing.totalDocs > 0) {
        const existingDoc = existing.docs[0]
        const needsUpdate =
          existingDoc.category !== section.category ||
          existingDoc.sortOrder !== i ||
          existingDoc.hidden !== false

        if (needsUpdate) {
          await payload.update({
            collection: 'media',
            id: existingDoc.id,
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
        continue
      }

      await createLocalizedMedia(
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
      console.log(`Created media for gallery: ${imagePath}`)
      created++
    }
  }

  console.log(`Gallery seed complete: ${created} created, ${updated} updated, ${skipped} skipped`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
