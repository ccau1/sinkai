/**
 * Shared media/R2 key conventions.
 *
 * `thumbKeyFor` MUST match the sinkai-cms-thumbnails worker exactly.
 */

/** Strip the extension from a filename (`photo.jpg` -> `photo`). */
export const stripExt = (filename: string): string => filename.replace(/\.[^.]+$/, '')

/**
 * R2 object key for an original file (`public/<filename>` or `private/<filename>`).
 * Legacy pre-migration files have no prefix and live at the bucket root.
 */
export const fileKeyFor = (prefix: string | null | undefined, filename: string): string =>
  prefix ? `${prefix}/${filename}` : filename

/** R2 object key for a thumbnail (`public/thumbnails/<basename>.webp`). */
export const thumbKeyFor = (filename: string): string =>
  `public/thumbnails/${stripExt(filename)}.webp`

/**
 * Public URL for a thumbnail, served from the media custom domain.
 * Returns an empty string when MEDIA_PUBLIC_URL is not configured.
 */
export const thumbUrlFor = (filename: string): string => {
  const base = process.env.MEDIA_PUBLIC_URL
  return base ? `${base}/${thumbKeyFor(filename)}` : ''
}
