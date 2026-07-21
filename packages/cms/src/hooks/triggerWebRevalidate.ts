import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'
import { getCfEnv } from '../lib/cloudflareEnv'

interface DocLike {
  _status?: string | null
  published?: boolean | null
  id?: string | number
}

/**
 * A document affects the deployed site when it is (or was) publicly visible:
 * - drafts-enabled collections (pages): `_status === 'published'`
 * - collections with a manual `published` checkbox: `published === true`
 * - everything else (media, media-categories, forms, navigation): always visible
 */
const isLive = (doc: DocLike | null | undefined): boolean => {
  if (!doc) return false
  if (doc._status != null) return doc._status === 'published'
  if (doc.published != null) return doc.published === true
  return true
}

/**
 * Ask the web worker to revalidate its ISR cache via /api/revalidate.
 * Never throws: content saves must not fail because the web worker is down.
 * Skips silently when REVALIDATE_SECRET/WEB_APP_URL are not configured
 * (e.g. local dev), which effectively disables the feature.
 */
async function triggerWebRevalidate(
  payload: Payload,
  context: Record<string, unknown>,
): Promise<void> {
  try {
    const env = await getCfEnv()
    const secret = env.REVALIDATE_SECRET || process.env.REVALIDATE_SECRET
    const baseUrl = env.WEB_APP_URL || process.env.WEB_APP_URL
    if (!secret || !baseUrl) {
      payload.logger.debug(
        '[triggerWebRevalidate] REVALIDATE_SECRET or WEB_APP_URL not set; skipping web revalidation.',
      )
      return
    }
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/revalidate`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${secret}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(context),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      payload.logger.warn(
        `[triggerWebRevalidate] Web revalidate returned ${res.status} for ${JSON.stringify(context)}.`,
      )
      return
    }
    payload.logger.info(
      `[triggerWebRevalidate] Web revalidation triggered for ${JSON.stringify(context)}.`,
    )
  } catch (err) {
    payload.logger.error({ err }, '[triggerWebRevalidate] Failed to trigger web revalidation.')
  }
}

export const revalidateWebAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  collection,
}) => {
  if (isLive(doc) || isLive(previousDoc)) {
    await triggerWebRevalidate(req.payload, { collection: collection.slug, id: doc?.id })
  }
  return doc
}

export const revalidateWebAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req,
  collection,
}) => {
  if (isLive(doc)) {
    await triggerWebRevalidate(req.payload, {
      collection: collection.slug,
      id: doc?.id,
      deleted: true,
    })
  }
  return doc
}

export const revalidateWebGlobalAfterChange: GlobalAfterChangeHook = async ({
  doc,
  req,
  global,
}) => {
  await triggerWebRevalidate(req.payload, { global: global.slug })
  return doc
}
