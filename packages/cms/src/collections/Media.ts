import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'altEn',
      type: 'text',
      required: true,
    },
    {
      name: 'altZhCN',
      type: 'text',
      required: true,
    },
    {
      name: 'altZhTW',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Sharp-based transforms are not supported on Cloudflare Workers yet
    crop: false,
    focalPoint: false,
  },
}
