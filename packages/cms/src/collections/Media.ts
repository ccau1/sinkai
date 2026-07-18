import type { CollectionConfig, Field } from 'payload'
import {
  isContentEditor,
  PERMISSIONS,
  userIsAdmin,
  hasPermission,
} from '../util/access'
import { createLocaleTabs, type LocaleSuffix } from '../util/localeTabs'

function buildMediaLocaleFields(suffix: LocaleSuffix, label: string): Field[] {
  const isEnglish = suffix === 'En'

  return [
    {
      name: `alt${suffix}`,
      type: 'text',
      label: isEnglish ? 'Alt Text' : '替代文本',
      required: true,
    },
  ]
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: isContentEditor,
    update: isContentEditor,
    delete: ({ req: { user } }) =>
      userIsAdmin(user) || hasPermission(user, PERMISSIONS.DELETE_MEDIA),
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [createLocaleTabs(buildMediaLocaleFields)],
  upload: {
    // Sharp-based transforms are not supported on Cloudflare Workers yet
    crop: false,
    focalPoint: false,
  },
}
