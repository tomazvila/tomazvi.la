import { remark } from 'remark'
import gfm from 'remark-gfm'

// Node types that carry no prose a reader would want in a search or social
// preview. Everything else contributes its text.
const SKIP = new Set([
  'heading',
  'code',
  'image',
  'imageReference',
  'html',
  'yaml',
  'thematicBreak',
  'footnoteDefinition',
  'footnoteReference',
])

function collect(node: any, out: string[]) {
  if (!node || SKIP.has(node.type)) return
  if (node.type === 'text' || node.type === 'inlineCode') {
    out.push(node.value)
    return
  }
  if (!node.children) return
  node.children.forEach((child: any) => collect(child, out))
  // Keep block-level content from running together into one word.
  if (node.type !== 'paragraph' && node.type !== 'root') return
  out.push(' ')
}

// Build a plain-text meta/OG description from a post's markdown body.
//
// This walks the same syntax tree remark builds for rendering rather than
// stripping markdown with regexes: escapes are already resolved in text nodes,
// link text is a child of the link, and list markers never exist as characters.
export default function makeDescription(markdown: string, max = 155): string {
  const tree = remark().use(gfm).parse(markdown || '')
  const parts: string[] = []
  collect(tree, parts)

  const raw = parts.join('').replace(/\s+/g, ' ').trim()
  return raw.length > max ? raw.slice(0, max).trimEnd() + '…' : raw
}
