import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const docsDir = path.resolve(dirname, '../docs')
const outputFile = path.resolve(dirname, '../src/components/AdminDocs/manifest.ts')

function extractOrder(fileName: string): number {
  const match = fileName.match(/^(\d+)-/)
  return match ? parseInt(match[1], 10) : 999
}

function extractSlug(fileName: string): string {
  return fileName.replace(/^\d+-/, '').replace(/\.md$/, '')
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : 'Untitled'
}

function toTemplateLiteralSafe(content: string): string {
  return content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

function main() {
  if (!fs.existsSync(docsDir)) {
    console.error(`Docs directory not found: ${docsDir}`)
    process.exit(1)
  }

  const files = fs
    .readdirSync(docsDir)
    .filter((file) => file.endsWith('.md'))
    .sort((a, b) => extractOrder(a) - extractOrder(b) || a.localeCompare(b))

  const entries = files.map((file) => {
    const content = fs.readFileSync(path.join(docsDir, file), 'utf-8')
    return {
      slug: extractSlug(file),
      title: toTemplateLiteralSafe(extractTitle(content)),
      order: extractOrder(file),
      content: toTemplateLiteralSafe(content),
    }
  })

  const lines = [
    '/* GENERATED FILE - do not edit manually. */',
    '/* Run `npm run generate:docs` in packages/cms to regenerate. */',
    '',
    'export interface DocPage {',
    '  slug: string',
    '  title: string',
    '  order: number',
    '  content: string',
    '}',
    '',
    'export const docs: DocPage[] = [',
    ...entries.map(
      (entry) =>
        `  {\n    slug: '${entry.slug}',\n    title: \`${entry.title}\`,\n    order: ${entry.order},\n    content: \`${entry.content}\`,\n  },`,
    ),
    ']',
    '',
  ]

  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, lines.join('\n'), 'utf-8')
  console.log(`Generated ${entries.length} docs pages -> ${outputFile}`)
}

main()
