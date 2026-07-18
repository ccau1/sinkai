// Stub for @vercel/og so it is not bundled into the Cloudflare Worker.
export function ImageResponse() {
  throw new Error('ImageResponse is not supported in this Worker')
}

export default ImageResponse
