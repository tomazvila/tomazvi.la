import type { Post } from '../interfaces'
import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

const postsDirectory = join(process.cwd(), '_posts')

export function getPostSlugs(locale: string) {
  const withLocale = `${postsDirectory}/${locale}`
  return fs.readdirSync(withLocale)
}

export function getPostBySlug(slug: string, locale: string, fields: string[] = []) {
  const withoutLocaleSlug = slug.replace(/\.md$/, '')
  const withLocale = `${locale}/${slug}`
  const realSlug = withLocale.replace(/\.md$/, '')
  const fullPath = join(postsDirectory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const items: Post = {}

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = withoutLocaleSlug
    }
    if (field === 'content') {
      items[field] = content
    }

    if (typeof data[field] !== 'undefined') {
      items[field] = data[field]
    }
  })

  return items
}

export function getAllPosts(locale: string, fields: string[] = []) {
  const slugs = getPostSlugs(locale)
  const posts = slugs
    .map((slug) => getPostBySlug(slug, locale, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
  return posts
}
