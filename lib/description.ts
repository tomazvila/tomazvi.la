// Build a plain-text meta/OG description from a post's markdown body.
export default function makeDescription(markdown: string, max = 155): string {
  const raw = (markdown || '')
    .replace(/^#{1,6}\s.*$/gm, ' ') // drop heading lines
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // drop images
    .replace(/\[\^[^\]]+\]/g, '') // drop footnote references
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> their text
    .replace(/[*_`>#]/g, '') // drop emphasis / code / quote marks
    .replace(/\s+/g, ' ')
    .trim()
  return raw.length > max ? raw.slice(0, max).trimEnd() + '…' : raw
}
