import type { InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import Container from '../../components/container'
import formatDate from '../../lib/formatDate'
import { shitposts } from '../../lib/getPost'
import markdownToHtml from '../../lib/markdownToHtml'
import makeDescription from '../../lib/description'
import { absoluteUrl } from '../../lib/site'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function PostPage({
  post,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { locale } = useRouter()

  return (
    <Container>
      <Head>
        <title>{`${post.title} | Tomas Mažvila blog`}</title>
        <meta name="description" content={post.description} key="description" />
        <meta property="og:title" content={post.title} key="og:title" />
        <meta property="og:description" content={post.description} key="og:description" />
        <meta property="og:type" content="article" key="og:type" />
        {post.coverImage ? (
          <meta property="og:image" content={absoluteUrl(post.coverImage)} key="og:image" />
        ) : null}
      </Head>

      <article>
        <header>
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <time className="flex mt-2 text-gray-400" dateTime={post.date}>
            {formatDate(post.date, locale)}
          </time>
        </header>

        <div
          className="prose mt-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </Container>
  )
}

// getStaticPaths below enumerates the files on disk and sets fallback: false,
// so every generated path resolves and `post` is always present. There is no
// missing or loading state to represent here.
export async function getStaticProps({ params, locale, locales }) {
  const post = shitposts.getBySlug(params.shit, locale, [
    'slug',
    'title',
    'date',
    'content',
    'coverImage',
    'translation',
  ])

  // `translation` names this post's slug in the other locale. With two locales
  // a single slug is unambiguous; a third would need a per-locale map.
  const others = post.translation ? locales.filter((l: string) => l !== locale) : []

  return {
    props: {
      post: {
        ...post,
        content: await markdownToHtml(post.content || ''),
        description: makeDescription(post.content || ''),
      },
      localeAlternates: Object.fromEntries(
        others.map((l: string) => [l, `/shits/${post.translation}`]),
      ),
      ...(await serverSideTranslations(locale)),
    },
  }
}

export async function getStaticPaths({ locales }) {
  return {
    paths: locales.flatMap((locale: string) =>
      shitposts.getAll(locale, ['slug']).map(({ slug }) => ({
        params: { shit: slug },
        locale,
      })),
    ),
    fallback: false,
  }
}
