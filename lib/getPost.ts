import type { Post } from '../interfaces'
import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

// Posts and shitposts are the same algorithm over a different root directory.
// One loader, parameterized by that directory — see the two exports below.
function makeLoader(directory: string) {
  function getSlugs(locale: string) {
    const withLocale = join(directory, locale)
    if (!fs.existsSync(withLocale)) {
      throw new Error(`Missing content directory: ${withLocale}`)
    }
    return fs.readdirSync(withLocale).filter((name) => name.endsWith('.md'))
  }

  // `fields` keeps the props payload small: index pages ask for metadata only
  // and must not ship every post's full markdown body in __NEXT_DATA__.
  function getBySlug(slug: string, locale: string, fields: string[] = []) {
    const realSlug = slug.replace(/\.md$/, '')
    const fullPath = join(directory, locale, `${realSlug}.md`)
    const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'))

    const items: Post = {}

    fields.forEach((field) => {
      // slug and content are derived, never read from frontmatter, so a post
      // that declares either key cannot overwrite them.
      if (field === 'slug') {
        items.slug = realSlug
      } else if (field === 'content') {
        items.content = content
      } else if (typeof data[field] !== 'undefined') {
        items[field] = data[field]
      }
    })

    return items
  }

  function getAll(locale: string, fields: string[] = []) {
    // 'date' is required for the sort to mean anything; ask for it always and
    // let callers drop it from their own props if they do not render it.
    const withDate = fields.includes('date') ? fields : [...fields, 'date']
    return getSlugs(locale)
      .map((slug) => getBySlug(slug, locale, withDate))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }

  return { getSlugs, getBySlug, getAll }
}

export const posts = makeLoader(join(process.cwd(), '_posts/posts'))
export const shitposts = makeLoader(join(process.cwd(), '_posts/shitposts'))
