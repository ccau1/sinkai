# sinkai-cms-thumbnails

Standalone Cloudflare Worker that generates media thumbnails for the CMS media
R2 bucket. It is only ever reached via the `THUMBNAILS` **service binding**
from the CMS worker — it has no public route and receives no public traffic.

## What it does

For an image stored in the media bucket, a 320px-wide WebP thumbnail is
produced (via Cloudflare Image Resizing on the public media host) and stored
at `public/thumbnails/<name>.webp` with `customMetadata.sourceEtag` set to the
source object's etag. That etag lets every entry point skip work when the
thumbnail is already up to date.

## Routes

- `POST /trigger` — body `{ key, filename, updatedAt }`. Creates a
  `ThumbnailWorkflow` instance (id `thumb-<filename>-<updatedAt>`); a
  duplicate instance id is treated as success. The workflow re-checks
  freshness, fetches the transformed image, and stores it in R2.
- `GET /check?key=<sourceKey>&filename=<filename>` — returns
  `{ status: 'fresh' | 'stale' | 'missing' }` by comparing the thumbnail's
  `sourceEtag` against the source etag (404 `{ status: 'missing' }` when the
  source object is gone).
- `POST /video-thumb?force=1` — for videos, where the CMS generates the WebP
  client-side and uploads it as the raw request body, with `x-source-key` and
  `x-filename` headers. Skips the write (200 `{ ok: true, skipped: true }`)
  when the stored thumbnail is already fresh, unless `?force=1`.
- Everything else — 404.

## How it's triggered

The CMS worker calls `env.THUMBNAILS.fetch(...)` against the routes above
(service binding), e.g. after media uploads/updates (`/trigger`), when
serving admin thumbnails (`/check`), and after client-side video frame
capture (`/video-thumb`).

## Deploy

```sh
# staging (default)
npx wrangler deploy -c packages/cms/workers/thumbnails/wrangler.jsonc

# production
npx wrangler deploy -c packages/cms/workers/thumbnails/wrangler.jsonc --env production
```
