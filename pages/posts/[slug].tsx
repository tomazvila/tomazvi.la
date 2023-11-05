import type { InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Comment from '../../components/comment'
import Container from '../../components/container'
import distanceToNow from '../../lib/dateRelative'
import { getAllPosts, getPostBySlug } from '../../lib/getPost'
import markdownToHtml from '../../lib/markdownToHtml'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function PostPage({
  post,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()

  console.log(`router.isFallback: ${router.isFallback}`)

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <Container>
      <Head>
        <title>{post.title} | My awesome blog</title>
      </Head>

      {router.isFallback ? (
        <div>Loading…</div>
      ) : (
        <div>
          <article>
            <header>
              <h1 className="text-4xl font-bold">{post.title}</h1>
              {post.excerpt ? (
                <p className="mt-2 text-xl">{post.excerpt}</p>
              ) : null}
              <time className="flex mt-2 text-gray-400">
                {distanceToNow(new Date(post.date))}
              </time>
            </header>

            <div
              className="prose mt-10"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          <Comment />
        </div>
      )}
    </Container>
  )
}

type Params = {
  params: {
    slug: string
  },
  locale: string
}

export async function getStaticProps({ params, locale }: Params) {
  const post = getPostBySlug(params.slug, locale, [
    'slug',
    'title',
    'excerpt',
    'date',
    'content',
  ]);

  const content = await markdownToHtml(post.content || '');

  const translationProps = await serverSideTranslations(locale);

  return {
    props: {
      post: {
        ...post,
        content,
      },
      ...translationProps, // Merge translation props into the props object
    },
  };
}

export async function getStaticPaths({ locales }) {
  const slugsWithLocales = locales.flatMap((locale: string) => {
    const posts = getAllPosts(locale, ['slug'])
    const slugsWithLocales = posts.map(({ slug }) => {
      return {
        slug: slug,
	locale: locale
      };
    })
    return slugsWithLocales;
  })

  const res = {
    paths: slugsWithLocales.map(({ slug, locale }) => {
      return {
        params: {
	  slug: slug
	},
	locale: locale
      };
    }),
    fallback: false,
  }

  return res;
}

