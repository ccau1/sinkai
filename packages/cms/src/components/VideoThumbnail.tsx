'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

type Status = 'idle' | 'checking' | 'fresh' | 'generating' | 'error'

const THUMB_WIDTH = 320

/**
 * Capture a frame from a same-origin video URL and encode it as webp.
 * Same-origin is required so the canvas is not tainted (the public media
 * domain sends no CORS headers).
 */
async function captureFrame(src: string): Promise<Blob> {
  const video = document.createElement('video')
  video.muted = true
  video.preload = 'auto'
  video.src = src

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve()
    video.onerror = () => reject(new Error('could not load video'))
  })

  const target =
    Number.isFinite(video.duration) && video.duration > 0 ? Math.min(video.duration * 0.1, 5) : 0.1

  await new Promise<void>((resolve) => {
    let settled = false
    const done = () => {
      if (!settled) {
        settled = true
        resolve()
      }
    }
    video.onseeked = done
    video.onerror = done // fall back to whatever frame is available
    try {
      video.currentTime = target
    } catch {
      done()
    }
    setTimeout(done, 5000)
  })

  const width = THUMB_WIDTH
  const aspect =
    video.videoWidth > 0 ? video.videoHeight / video.videoWidth : 9 / 16
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = Math.max(1, Math.round(width * aspect))

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d context unavailable')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('failed to encode thumbnail'))),
      'image/webp',
      0.8,
    )
  })
}

export default function VideoThumbnail() {
  const { id } = useDocumentInfo()
  const mimeType = useFormFields(([fields]) => fields?.mimeType?.value as string | undefined)
  const filename = useFormFields(([fields]) => fields?.filename?.value as string | undefined)
  const prefix = useFormFields(([fields]) => fields?.prefix?.value as string | undefined)

  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const runningRef = useRef(false)

  const isVideo = typeof mimeType === 'string' && mimeType.startsWith('video/')
  const sourceKey = filename ? (prefix ? `${prefix}/${filename}` : filename) : ''

  const generate = useCallback(
    async (force: boolean) => {
      if (!filename || !sourceKey || runningRef.current) return
      runningRef.current = true
      setStatus('generating')
      setErrorMessage('')
      try {
        const videoSrc = `/api/media/file/${encodeURIComponent(filename)}?prefix=${encodeURIComponent(prefix || 'public')}`
        const blob = await captureFrame(videoSrc)

        const res = await fetch(
          `/api/media/video-thumb?key=${encodeURIComponent(sourceKey)}&filename=${encodeURIComponent(filename)}${force ? '&force=1' : ''}`,
          {
            method: 'POST',
            headers: { 'content-type': 'image/webp' },
            body: blob,
          },
        )
        if (!res.ok) {
          throw new Error(`upload failed with status ${res.status}`)
        }
        setStatus('fresh')
      } catch (err) {
        console.error('[VideoThumbnail] capture failed:', err)
        setErrorMessage(err instanceof Error ? err.message : 'unknown error')
        setStatus('error')
      } finally {
        runningRef.current = false
      }
    },
    [filename, prefix, sourceKey],
  )

  useEffect(() => {
    // Only run on the edit view, once a saved video document is loaded.
    if (!id || !isVideo || !filename || !sourceKey) return

    let cancelled = false
    ;(async () => {
      setStatus('checking')
      try {
        const res = await fetch(
          `/api/media/video-thumb/check?key=${encodeURIComponent(sourceKey)}&filename=${encodeURIComponent(filename)}`,
        )
        const data = (await res.json()) as { status?: string }
        if (cancelled) return
        if (data.status === 'fresh') {
          setStatus('fresh')
        } else {
          await generate(false)
        }
      } catch (err) {
        if (cancelled) return
        console.error('[VideoThumbnail] check failed:', err)
        setErrorMessage(err instanceof Error ? err.message : 'unknown error')
        setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isVideo, filename, sourceKey])

  if (!isVideo) return null

  const statusText =
    status === 'checking'
      ? 'Checking video thumbnail…'
      : status === 'generating'
        ? 'Generating video thumbnail…'
        : status === 'fresh'
          ? 'Video thumbnail is up to date.'
          : status === 'error'
            ? `Video thumbnail error: ${errorMessage}`
            : 'Video thumbnail'

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--theme-elevation-50, #f7f7f7)',
        borderRadius: '8px',
        border: '1px solid var(--theme-elevation-200, #e5e5e5)',
        marginTop: '8px',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600 }}>Video Thumbnail</h3>
      <p style={{ margin: 0, color: 'var(--theme-elevation-600, #666)' }}>{statusText}</p>
      <button
        type="button"
        disabled={status === 'checking' || status === 'generating'}
        onClick={() => void generate(true)}
        style={{
          marginTop: '8px',
          padding: '6px 12px',
          border: '1px solid var(--theme-elevation-200, #e5e5e5)',
          borderRadius: '4px',
          background: 'var(--theme-elevation-100, #eee)',
          cursor: 'pointer',
        }}
      >
        Regenerate
      </button>
    </div>
  )
}
