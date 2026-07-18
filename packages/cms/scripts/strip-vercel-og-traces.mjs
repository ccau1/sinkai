import { readdirSync, readFileSync, writeFileSync, statSync, rmSync } from 'node:fs'
import { join } from 'node:path'

function walk(dir, cb) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(path, cb)
    } else {
      cb(path)
    }
  }
}

let traceEntries = 0
let filesRemoved = 0

// Remove @vercel/og entries from Next.js NFT trace files so they are not copied
// into the standalone / open-next output.
try {
  walk('.next/server', (path) => {
    if (!path.endsWith('.nft.json')) return
    const data = JSON.parse(readFileSync(path, 'utf8'))
    const before = data.files?.length || 0
    data.files = (data.files || []).filter((file) => !file.includes('@vercel/og'))
    if (data.files.length !== before) {
      writeFileSync(path, JSON.stringify(data))
      traceEntries += before - data.files.length
    }
  })
} catch (err) {
  if (err.code !== 'ENOENT') throw err
}

// Also remove any copied @vercel/og files from the open-next bundle.
try {
  walk('.open-next', (path) => {
    if (path.includes('@vercel/og') && statSync(path).isFile()) {
      rmSync(path, { force: true })
      filesRemoved++
    }
  })
} catch (err) {
  if (err.code !== 'ENOENT') throw err
}

console.log(`Stripped ${traceEntries} @vercel/og trace entries, removed ${filesRemoved} files`)
