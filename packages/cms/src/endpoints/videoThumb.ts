import type { PayloadHandler, PayloadRequest } from 'payload'
import { getCfEnv } from '../lib/cloudflareEnv'

/**
 * Custom endpoints proxying the sinkai-cms-thumbnails worker.
 * Both require an authenticated admin user.
 *
 * Mounted on the Media collection:
 *   GET  /api/media/video-thumb/check?key=<sourceKey>&filename=<filename>
 *   POST /api/media/video-thumb?key=<sourceKey>&filename=<filename>[&force=1]
 */

const getSearchParams = (req: PayloadRequest): URLSearchParams => {
  if (req.searchParams) return req.searchParams
  const url = typeof req.url === 'string' ? req.url : '/'
  return new URL(url, 'http://localhost').searchParams
}

const proxyResponse = async (res: {
  status: number
  headers: { get(name: string): string | null }
  text(): Promise<string>
}): Promise<Response> =>
  new Response(await res.text(), {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
  })

export const checkVideoThumb: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = getSearchParams(req)
  const key = searchParams.get('key')
  const filename = searchParams.get('filename')
  if (!key || !filename) {
    return Response.json({ error: 'expected query params key and filename' }, { status: 400 })
  }

  try {
    const env = await getCfEnv()
    const res = await env.THUMBNAILS.fetch(
      `https://thumbnails/check?key=${encodeURIComponent(key)}&filename=${encodeURIComponent(filename)}`,
    )
    return proxyResponse(res)
  } catch (err) {
    req.payload.logger.error({ err }, '[videoThumb] Thumbnail check failed.')
    return Response.json({ error: 'thumbnail check failed' }, { status: 502 })
  }
}

export const postVideoThumb: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = getSearchParams(req)
  const key =
    searchParams.get('key') || req.headers.get('x-source-key') || ''
  const filename =
    searchParams.get('filename') || req.headers.get('x-filename') || ''
  if (!key || !filename) {
    return Response.json(
      { error: 'expected key and filename (query params or x-source-key/x-filename headers)' },
      { status: 400 },
    )
  }

  if (typeof req.arrayBuffer !== 'function') {
    return Response.json({ error: 'request body unavailable' }, { status: 400 })
  }
  const body = await req.arrayBuffer()
  if (!body || body.byteLength === 0) {
    return Response.json({ error: 'expected a webp request body' }, { status: 400 })
  }

  const force = searchParams.get('force') === '1'

  try {
    const env = await getCfEnv()
    const res = await env.THUMBNAILS.fetch(
      `https://thumbnails/video-thumb${force ? '?force=1' : ''}`,
      {
        method: 'POST',
        headers: {
          'x-source-key': key,
          'x-filename': filename,
          'content-type': 'image/webp',
        },
        body,
      },
    )
    return proxyResponse(res)
  } catch (err) {
    req.payload.logger.error({ err }, '[videoThumb] Video thumbnail upload failed.')
    return Response.json({ error: 'video thumbnail upload failed' }, { status: 502 })
  }
}
