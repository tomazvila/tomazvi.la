// Build-time: keep public/ and the post corpus in agreement.
//
// Assets are referenced two ways — frontmatter keys and raw markdown/HTML in
// post bodies — but both live inside _posts, so liveness is just "does this
// path appear anywhere in the corpus". Without this check, deleting a post
// leaves its images behind silently; that is how 90 MB of orphans accumulated.
const fs = require('fs')
const path = require('path')

const root = process.cwd()
const publicDir = path.join(root, 'public')
const postsDir = path.join(root, '_posts')

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

// public/locales is served to the i18n client, not referenced from posts.
const assets = walk(publicDir)
  .filter((f) => !f.startsWith(path.join(publicDir, 'locales')))
  .map((f) => '/' + path.relative(publicDir, f).split(path.sep).join('/'))

const corpus = walk(postsDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => fs.readFileSync(f, 'utf8'))
  .join('\n')

const orphans = assets.filter((a) => !corpus.includes(a))

const referenced = new Set(corpus.match(/\/assets\/[A-Za-z0-9._/-]+/g) || [])
const missing = [...referenced].filter((r) => !assets.includes(r))

for (const o of orphans) console.warn(`warning: unreferenced asset ${o}`)
for (const m of missing) console.error(`error: missing asset ${m}`)

console.log(
  `checked ${assets.length} assets: ${orphans.length} unreferenced, ${missing.length} missing`,
)

// A referenced-but-absent asset is a broken image on a live page — fail the
// build. An unreferenced one is only waste, so warn and let the build proceed.
if (missing.length) process.exit(1)
