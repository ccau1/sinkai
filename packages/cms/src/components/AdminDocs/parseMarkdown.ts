function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function parseInline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`)
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

export function parseMarkdown(md: string): string {
  const lines = md.split(/\r?\n/)
  const blocks: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i++
      continue
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      const code = escapeHtml(codeLines.join('\n'))
      blocks.push(
        `<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${code}</code></pre>`,
      )
      continue
    }

    if (line.startsWith('#')) {
      const match = line.match(/^(#{1,6})\s+(.*)$/)
      if (match) {
        const level = match[1].length
        const text = parseInline(match[2])
        blocks.push(`<h${level}>${text}</h${level}>`)
      }
      i++
      continue
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      blocks.push(`<blockquote>${parseInline(quoteLines.join(' '))}</blockquote>`)
      continue
    }

    if (line.match(/^(\s*)[-*+]\s+/)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^(\s*)[-*+]\s+/)) {
        items.push(lines[i].replace(/^(\s*)[-*+]\s+/, ''))
        i++
      }
      blocks.push(`<ul>${items.map((item) => `<li>${parseInline(item)}</li>`).join('')}</ul>`)
      continue
    }

    if (line.match(/^(\s*)\d+\.\s+/)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^(\s*)\d+\.\s+/)) {
        items.push(lines[i].replace(/^(\s*)\d+\.\s+/, ''))
        i++
      }
      blocks.push(`<ol>${items.map((item) => `<li>${parseInline(item)}</li>`).join('')}</ol>`)
      continue
    }

    if (line.trim() === '---') {
      blocks.push('<hr />')
      i++
      continue
    }

    // Paragraph
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== '') {
      paraLines.push(lines[i])
      i++
    }
    blocks.push(`<p>${parseInline(paraLines.join(' '))}</p>`)
  }

  return blocks.join('\n')
}
