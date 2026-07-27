import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { getCloudflareContext, type CloudflareContext } from '@opennextjs/cloudflare'
import type { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { defaultLocale, payloadLocales } from './locales'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { MediaCategories } from './collections/MediaCategories'
import { Installations } from './collections/Installations'
import { InstallationTypes } from './collections/InstallationTypes'
import { Blogs } from './collections/Blogs'
import { Pages } from './collections/Pages'
import { Testimonies } from './collections/Testimonies'
import { Donations } from './collections/Donations'
import { Events } from './collections/Events'
import { Navigation } from './globals/Navigation'
import { ContactSettings } from './globals/ContactSettings'
import { handleFormSubmission } from './hooks/handleFormSubmission'
import { populateShareableLinks } from './hooks/populateShareableLinks'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from './hooks/triggerWebRevalidate'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) => realpath(value)?.endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as unknown as import('payload').PayloadLogger // Use PayloadLogger type when it's exported

const useWranglerProxy =
  isCLI ||
  !isProduction ||
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.PAYLOAD_REMOTE === 'true'

const cloudflare = useWranglerProxy
  ? await getCloudflareContextFromWrangler()
  : await getCloudflareContext({ async: true })

const aiLocalizationPlugin = process.env.OPENAI_API_KEY
  ? (
      await import('payload-plugin-ai-localization')
    ).aiLocalization({
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
          model: 'gpt-4.1-nano',
        },
        collections: {
          blogs: {
            fields: ['slugName', 'title', 'excerpt', 'content'],
          },
          installations: {
            fields: ['title', 'location', 'description'],
          },
          'installation-types': {
            fields: ['label'],
          },
          pages: {
            fields: ['title', 'excerpt', 'content'],
          },
          media: {
            fields: ['alt'],
          },
          testimonies: {
            fields: ['name', 'role', 'synopsis', 'content'],
          },
          events: {
            fields: ['title', 'description'],
          },
        },
      })
  : null

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    suppressHydrationWarning: true,
    // Lock the admin panel to light mode for a bright, charity-friendly UI.
    theme: 'light',
    // Replace the Payload logo with the charity name on the login page.
    components: {
      graphics: {
        Logo: './components/AdminLogo#default',
      },
    },
    meta: {
      titleSuffix: '- 善啓慈善基金會',
    },
    dashboard: {
      widgets: [
        {
          slug: 'collection-previews',
          Component: './components/Dashboard/CollectionPreviews#default',
          minWidth: 'full',
        },
      ],
      defaultLayout: [{ widgetSlug: 'collection-previews', width: 'full' }],
    },
  },
  collections: [
    Blogs,
    Installations,
    InstallationTypes,
    Testimonies,
    Events,
    Donations,
    Pages,
    Media,
    MediaCategories,
    Users,
  ],
  globals: [Navigation, ContactSettings],
  graphQL: {
    disable: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  localization: {
    locales: payloadLocales,
    defaultLocale,
    fallback: true,
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    // Disable Drizzle's interactive dev schema push; rely on explicit migrations instead.
    push: false,
  }),
  onInit: async () => {
    // Make it obvious in the console which D1 database the CMS is using.
    console.log(
      `[payload] CMS using ${process.env.PAYLOAD_REMOTE === 'true' ? 'REMOTE D1' : 'local D1'}`,
    )
  },
  cors: [
    'https://sinkai.tribalorigin.com',
    'https://sinkai.staging.tribalorigin.com',
    'http://localhost:3000',
    'http://localhost:3200',
    'http://localhost',
  ],
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    r2Storage({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bucket: cloudflare.env.R2 as any,
      collections: {
        media: {
          // Empty collection prefix: this makes the plugin inject the hidden
          // per-document `prefix` field, which the media `visibility` field
          // manages ('public' | 'private').
          prefix: '',
          generateFileURL: ({ filename, prefix }) =>
            prefix === 'private'
              ? `/api/media/file/${encodeURIComponent(filename)}?prefix=private`
              : prefix && process.env.MEDIA_PUBLIC_URL
                ? `${process.env.MEDIA_PUBLIC_URL}/${prefix}/${filename}`
                : // Serve through the CMS when the public media domain is not
                  // configured (e.g. local dev) or for legacy pre-migration files.
                  `/api/media/file/${encodeURIComponent(filename)}${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''}`,
        },
      },
    }),
    seoPlugin({
      collections: ['blogs', 'installations', 'pages'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => (doc as { title?: string }).title || '',
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string }).excerpt || '',
      generateURL: ({ doc, collectionConfig }) => {
        const d = doc as {
          slugName?: string
          shortId?: string
          slug?: string
        }
        if (collectionConfig?.slug === 'blogs' && d.slugName && d.shortId) {
          return `/blog/${d.slugName}/${d.shortId}`
        }
        if (collectionConfig?.slug === 'installations' && d.slug) {
          return `/installations/${d.slug}`
        }
        if (collectionConfig?.slug === 'pages' && d.slug) {
          return `/${d.slug}`
        }
        return ''
      },
      tabbedUI: true,
    }),
    formBuilderPlugin({
      fields: {
        checkbox: true,
        country: true,
        email: true,
        message: true,
        number: true,
        payment: false,
        select: true,
        state: true,
        text: true,
        textarea: true,
        upload: true,
      },
      uploadCollections: ['media'],
      formOverrides: {
        admin: {
          group: {
            en: 'Website',
            'zh-CN': '网站',
            'zh-TW': '網站',
          },
        },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'shareableLinks',
            type: 'textarea',
            virtual: true,
            label: 'Shareable links',
            admin: {
              readOnly: true,
              position: 'sidebar',
              description:
                'Copy the link for the locale you need and send it to end users.',
              rows: 3,
            },
          },
        ],
        hooks: {
          afterRead: [populateShareableLinks],
          afterChange: [revalidateWebAfterChange],
          afterDelete: [revalidateWebAfterDelete],
        },
      },
      formSubmissionOverrides: {
        admin: {
          group: {
            en: 'Website',
            'zh-CN': '网站',
            'zh-TW': '網站',
          },
        },
        hooks: {
          afterChange: [handleFormSubmission],
        },
      },
    }),
    ...(aiLocalizationPlugin ? [aiLocalizationPlugin] : []),

  ],
})

function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction && process.env.PAYLOAD_REMOTE === 'true',
        persist: process.env.PAYLOAD_PERSIST === 'false' ? false : true,
      } satisfies GetPlatformProxyOptions),
  )
}
