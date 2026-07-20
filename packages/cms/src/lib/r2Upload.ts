/**
 * Direct R2 object uploads via the Cloudflare REST API.
 *
 * This is used by seed/repair scripts because `getPlatformProxy` with
 * `remoteBindings: true` does not reliably write uploaded files to remote R2
 * from a Node/TSX context.
 */

import fs from 'fs'
import path from 'path'

function getWranglerJsonc(): unknown {
  const filename = path.resolve(process.cwd(), 'wrangler.jsonc')
  const raw = fs.readFileSync(filename, 'utf-8')
  // Strip single-line and block comments so the file can be parsed as JSON.
  const stripped = raw
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
  return JSON.parse(stripped)
}

function getBucketNameFromWrangler(): string {
  const envName = process.env.CLOUDFLARE_ENV
  const config = getWranglerJsonc() as Record<string, unknown>
  const target =
    envName &&
    typeof config.env === 'object' &&
    config.env !== null &&
    envName in (config.env as Record<string, unknown>)
      ? (config.env as Record<string, unknown>)[envName]
      : config

  if (typeof target !== 'object' || target === null) {
    throw new Error('Could not read wrangler.jsonc target environment')
  }

  const buckets = (target as Record<string, unknown>).r2_buckets
  if (!Array.isArray(buckets)) {
    throw new Error('No r2_buckets found in wrangler.jsonc')
  }

  const bucket = buckets.find((b: unknown) => {
    return (
      typeof b === 'object' &&
      b !== null &&
      (b as Record<string, unknown>).binding === 'R2'
    )
  }) as Record<string, unknown> | undefined

  if (typeof bucket?.bucket_name !== 'string') {
    throw new Error('R2 bucket_name not found in wrangler.jsonc')
  }

  return bucket.bucket_name
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  }
  return map[ext] || 'application/octet-stream'
}

function requireCredentials(): { accountId: string; token: string; bucketName: string } {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!accountId || !token) {
    throw new Error(
      'CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required for R2 uploads',
    )
  }
  return { accountId, token, bucketName: getBucketNameFromWrangler() }
}

function objectUrl(bucketName: string, accountId: string, objectKey: string): string {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}`
}

export async function r2UploadFile(
  filePath: string,
  objectKey: string,
  buffer?: Buffer,
): Promise<void> {
  const { accountId, token, bucketName } = requireCredentials()
  const body = buffer ?? fs.readFileSync(filePath)
  const res = await fetch(objectUrl(bucketName, accountId, objectKey), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': getMimeType(filePath),
    },
    body: body as unknown as BodyInit,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`R2 upload failed for ${objectKey}: ${res.status} ${text}`)
  }
}

export async function r2ObjectExists(objectKey: string): Promise<boolean> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!accountId || !token) return false
  const bucketName = getBucketNameFromWrangler()
  const res = await fetch(objectUrl(bucketName, accountId, objectKey), {
    method: 'HEAD',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.ok
}

export { getMimeType }
