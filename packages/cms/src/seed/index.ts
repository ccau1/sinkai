import fs from 'fs'
import path from 'path'

import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import { blogPosts } from './blog-data'
import { generateShortId } from '../util/shortId'

dotenvConfig({ path: '.env' })

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
      console.log(`Skipping existing blog: ${post.slug}`)
      skipped++
      continue
    }

    // Create media for cover image
    let coverImageId: number | string | undefined
    const coverPath = path.join(webPublicDir, post.coverImage)
    if (fs.existsSync(coverPath)) {
      const media = await payload.create({
        collection: 'media',
        data: {
          altEn: post.translations.en.title,
          altZhCN: post.translations['zh-CN'].title,
          altZhTW: post.translations['zh-TW'].title,
        },
        filePath: coverPath,
      })
      coverImageId = media.id
      console.log(`Created media for cover: ${post.coverImage}`)
    } else {
      console.warn(`Cover image not found: ${coverPath}`)
    }

    await payload.create({
      collection: 'blogs',
      data: {
        slugNameEn: post.slug,
        slugNameZhCN: post.slug,
        slugNameZhTW: post.slug,
        shortId,
        titleEn: post.translations.en.title,
        titleZhCN: post.translations['zh-CN'].title,
        titleZhTW: post.translations['zh-TW'].title,
        excerptEn: post.translations.en.excerpt,
        excerptZhCN: post.translations['zh-CN'].excerpt,
        excerptZhTW: post.translations['zh-TW'].excerpt,
        legacyContentEn: post.translations.en.content,
        legacyContentZhCN: post.translations['zh-CN'].content,
        legacyContentZhTW: post.translations['zh-TW'].content,
        coverImage: coverImageId as number,
        date: post.date,
        published: true,
      },
    })

    console.log(`Created blog: ${post.slug}`)
    created++
  }

  console.log(`\nSeed complete: ${created} created, ${skipped} skipped`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
