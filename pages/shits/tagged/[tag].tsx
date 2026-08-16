import type { InferGetStaticPropsType } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Container from '../../../components/container'
import formatDate from '../../../lib/formatDate'
import { shitposts } from '../../../lib/getPost'
import shitTags from '../../../lib/shit-tags.json'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function TaggedPage({
  taggedPosts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { locale } = useRouter()

  return (
    <Container>
      {taggedPosts.map((post) => (
        <article key={post.slug} className="mb-10">
          <Link
            href={`/shits/${post.slug}`}
            className="text-lg leading-6 font-bold"
          >
            {post.title}
          </Link>
          <div className="text-gray-400">
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          </div>
        </article>
      ))}
    </Container>
  )
}

const tagsByLocale = shitTags as Record<string, string[]>

export async function getStaticProps({ params, locale }) {
  const all = shitposts.getAll(locale, ['slug', 'title', 'date', 'tags'])

  return {
    props: {
      taggedPosts: all.filter((post) => post.tags?.includes(params.tag)),
      ...(await serverSideTranslations(locale)),
    },
  }
}

// Only tags that actually have posts get a page, per locale. lib/shit-tags.json
// is regenerated from frontmatter by the prebuild step, so a tag cannot be
// linked in the nav without this route existing, and an empty tag page cannot
// be generated at all.
export async function getStaticPaths({ locales }) {
  return {
    paths: locales.flatMap((locale: string) =>
      (tagsByLocale[locale] || []).map((tag) => ({ params: { tag }, locale })),
    ),
    fallback: false,
  }
}
