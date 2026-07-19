import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from 'cloudflare:workers'

interface Env {
  R2: R2Bucket
  THUMBNAIL_WORKFLOW: Workflow
  MEDIA_PUBLIC_HOST: string
}

/**
 * Thumbnail object key for a given source filename.
 * Must match the CMS-side logic exactly.
 */
const thumbKeyFor = (filename: string) =>
  `public/thumbnails/${filename.replace(/\.[^.]+$/, '')}.webp`

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  })

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // POST /trigger — kick off a thumbnail generation workflow instance.
    if (request.method === 'POST' && url.pathname === '/trigger') {
      let body: { key?: unknown; filename?: unknown; updatedAt?: unknown }
      try {
        body = await request.json()
      } catch {
        return json({ error: 'invalid JSON body' }, { status: 400 })
      }
      const { key, filename, updatedAt } = body
      if (
        typeof key !== 'string' ||
        typeof filename !== 'string' ||
        typeof updatedAt !== 'string' ||
        !key ||
        !filename ||
        !updatedAt
      ) {
        return json(
          { error: 'expected JSON body { key, filename, updatedAt }' },
          { status: 400 },
        )
      }

      try {
        await env.THUMBNAIL_WORKFLOW.create({
          id: `thumb-${filename}-${updatedAt}`,
          params: { key, filename },
        })
      } catch (err) {
        // An instance with this id already exists (or is running): the work
        // is already scheduled, so treat it as success.
        if (err instanceof Error && err.message.includes('already exists')) {
          return json({ ok: true })
        }
        throw err
      }
      return json({ ok: true })
    }

    // GET /check?key=<sourceKey>&filename=<filename> — freshness probe.
    if (request.method === 'GET' && url.pathname === '/check') {
      const key = url.searchParams.get('key')
      const filename = url.searchParams.get('filename')
      if (!key || !filename) {
        return json(
          { error: 'expected query params key and filename' },
          { status: 400 },
        )
      }

      const source = await env.R2.head(key)
      if (!source) return json({ status: 'missing' }, { status: 404 })

      const thumb = await env.R2.head(thumbKeyFor(filename))
      if (!thumb) return json({ status: 'missing' })

      if (thumb.customMetadata?.sourceEtag !== source.etag) {
        return json({ status: 'stale' })
      }
      return json({ status: 'fresh' })
    }

    // POST /video-thumb?force=1 — store a client-generated webp thumbnail.
    if (request.method === 'POST' && url.pathname === '/video-thumb') {
      const key = request.headers.get('x-source-key')
      const filename = request.headers.get('x-filename')
      if (!key || !filename) {
        return json(
          { error: 'expected x-source-key and x-filename headers' },
          { status: 400 },
        )
      }

      const source = await env.R2.head(key)
      if (!source) return json({ error: 'source not found' }, { status: 404 })

      const force = url.searchParams.get('force') === '1'
      const thumb = await env.R2.head(thumbKeyFor(filename))
      if (!force && thumb && thumb.customMetadata?.sourceEtag === source.etag) {
        return json({ ok: true, skipped: true })
      }

      await env.R2.put(thumbKeyFor(filename), request.body, {
        httpMetadata: { contentType: 'image/webp' },
        customMetadata: { sourceEtag: source.etag },
      })
      return json({ ok: true })
    }

    return json({ error: 'not found' }, { status: 404 })
  },
}

type Params = { key: string; filename: string }

export class ThumbnailWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { key, filename } = event.payload
    const thumbKey = thumbKeyFor(filename)

    const decision = await step.do('check-existing', async () => {
      const source = await this.env.R2.head(key)
      if (!source) return { run: false as const, reason: 'source-missing' }
      const thumb = await this.env.R2.head(thumbKey)
      if (thumb && thumb.customMetadata?.sourceEtag === source.etag) {
        return { run: false as const, reason: 'fresh' }
      }
      return { run: true as const, etag: source.etag }
    })
    if (!decision.run) return decision

    const image = await step.do('transform', async () => {
      const res = await fetch(
        `https://${this.env.MEDIA_PUBLIC_HOST}/cdn-cgi/image/width=320,quality=80,format=webp/${key}`,
      )
      if (!res.ok) throw new Error(`transform failed: ${res.status}`)
      return await res.arrayBuffer()
    })

    await step.do('store', async () => {
      await this.env.R2.put(thumbKey, image, {
        httpMetadata: { contentType: 'image/webp' },
        customMetadata: { sourceEtag: decision.etag },
      })
    })
    return { ok: true, thumbKey }
  }
}
