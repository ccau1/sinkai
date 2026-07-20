import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterOperationHook,
  CollectionBeforeChangeHook,
  Payload,
} from 'payload'
import { getCfEnv } from '../lib/cloudflareEnv'
import { fileKeyFor, thumbKeyFor } from '../lib/media'

interface MediaDocLike {
  filename?: string | null
  mimeType?: string | null
  prefix?: string | null
  updatedAt?: string | null
}

/**
 * Keep the storage plugin's hidden `prefix` field in sync with `visibility`
 * before the document (and any uploaded file) is written.
 */
export const setPrefixFromVisibility: CollectionBeforeChangeHook = ({ data }) => {
  data.prefix = data.visibility === 'private' ? 'private' : 'public'
  return data
}

const isImage = (doc: MediaDocLike) => doc.mimeType?.startsWith('image/') ?? false

/**
 * Enqueue thumbnail generation for a public image. The worker de-duplicates
 * by source etag, so repeated triggers for an unchanged file are cheap no-ops.
 * Never throws: the CMS must not fail because the thumbnails worker is down.
 */
async function triggerThumbnail(payload: Payload, doc: MediaDocLike): Promise<void> {
  if (!doc.filename) return
  try {
    const env = await getCfEnv()
    if (!env.THUMBNAILS) {
      payload.logger.warn('[mediaVisibility] THUMBNAILS binding not available; skipping thumbnail trigger.')
      return
    }
    const res = await env.THUMBNAILS.fetch('https://thumbnails/trigger', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        key: fileKeyFor(doc.prefix, doc.filename),
        filename: doc.filename,
        updatedAt: doc.updatedAt ?? new Date().toISOString(),
      }),
    })
    if (!res.ok) {
      payload.logger.warn(
        `[mediaVisibility] Thumbnail trigger returned ${res.status} for ${doc.filename}.`,
      )
      return
    }
    payload.logger.info(`[mediaVisibility] Thumbnail workflow triggered for ${doc.filename}.`)
  } catch (err) {
    payload.logger.error({ err }, '[mediaVisibility] Failed to trigger thumbnail generation.')
  }
}

/**
 * When `visibility` (and therefore `prefix`) changes without a new upload,
 * move the underlying R2 object to match. Also cleans up stale thumbnails.
 */
export const syncVisibilityStorage: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (!previousDoc || previousDoc.prefix === doc.prefix || !doc.filename) {
    return doc
  }

  const oldKey = fileKeyFor(previousDoc.prefix as string | undefined, previousDoc.filename as string)
  const newKey = fileKeyFor(doc.prefix as string | undefined, doc.filename as string)

  try {
    const env = await getCfEnv()

    if (req.file) {
      // A new file was uploaded to the new prefix by the storage plugin. The
      // plugin only deletes the previous object when the filename changed, so
      // clean up the same-name object at the old prefix ourselves.
      if (previousDoc.filename === doc.filename && previousDoc.prefix) {
        await env.R2.delete(oldKey)
      }
    } else {
      // No new upload: move the existing object in R2.
      const obj = await env.R2.get(oldKey)
      if (obj) {
        await env.R2.put(newKey, obj.body, {
          httpMetadata: obj.httpMetadata,
          customMetadata: obj.customMetadata,
        })
        await env.R2.delete(oldKey)
      } else {
        req.payload.logger.warn(
          `[mediaVisibility] R2 object ${oldKey} not found while moving to ${newKey}.`,
        )
      }
    }

    if (doc.prefix === 'private') {
      // Never leave a public thumbnail behind for a private file.
      await env.R2.delete(thumbKeyFor(doc.filename as string)).catch(() => {})
    } else if (isImage(doc) && !req.file) {
      // Moved to public without a fresh upload: make sure a thumbnail exists.
      await triggerThumbnail(req.payload, doc)
    }
  } catch (err) {
    req.payload.logger.error(
      { err },
      `[mediaVisibility] Failed to sync R2 object from ${oldKey} to ${newKey}.`,
    )
  }

  return doc
}

/**
 * Trigger thumbnail generation after a file upload completes.
 *
 * This runs as an afterOperation (not afterChange) hook because the storage
 * adapter uploads the file to R2 in its own afterChange hook, which runs
 * after collection-level afterChange hooks — afterOperation is the first
 * point where the source object is guaranteed to exist in R2.
 */
export const triggerThumbnailAfterUpload: CollectionAfterOperationHook = async ({
  operation,
  req,
  result,
}) => {
  if (operation !== 'create' && operation !== 'update' && operation !== 'updateByID') {
    return result
  }

  const doc = result as unknown as MediaDocLike
  if (doc.prefix === 'private' || !isImage(doc)) {
    return result
  }

  // Trigger for both file uploads and metadata-only changes. The workflow
  // de-duplicates by source etag, so repeated triggers for unchanged files are
  // cheap no-ops. This also covers cases where req.file is not exposed in the
  // afterOperation context while a file was actually uploaded.
  await triggerThumbnail(req.payload, doc)
  return result
}

/** Remove the public thumbnail when a public image or video is deleted. */
export const deleteThumbnailAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const mimeType = doc.mimeType as string | undefined
  if (
    doc.prefix === 'private' ||
    !doc.filename ||
    !mimeType ||
    (!mimeType.startsWith('image/') && !mimeType.startsWith('video/'))
  ) {
    return doc
  }

  try {
    const env = await getCfEnv()
    if (!env.R2) {
      req.payload.logger.warn(
        `[mediaVisibility] R2 binding not available; skipping thumbnail delete for ${doc.filename}.`,
      )
      return doc
    }
    await env.R2.delete(thumbKeyFor(doc.filename as string))
  } catch (err) {
    req.payload.logger.warn(
      { err },
      `[mediaVisibility] Failed to delete thumbnail for ${doc.filename}.`,
    )
  }

  return doc
}
