// Build-time: record which shitpost tags actually have posts, per locale.
// Output is read by components/header.tsx to hide empty tag links.
const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const root = process.cwd()
const base = path.join(root, '_posts', 'shitposts')
const result = {}

if (fs.existsSync(base)) {
  for (const locale of fs.readdirSync(base)) {
    const dir = path.join(base, locale)
    if (!fs.statSync(dir).isDirectory()) continue
    const tags = new Set()
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md')) continue
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'))
      if (Array.isArray(data.tags)) data.tags.forEach((t) => tags.add(t))
    }
    result[locale] = [...tags].sort()
  }
}

const out = path.join(root, 'lib', 'shit-tags.json')
fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n')
console.log('generated lib/shit-tags.json:', JSON.stringify(result))
