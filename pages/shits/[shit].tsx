import type { InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Comment from '../../components/comment'
import Container from '../../components/container'
import distanceToNow from '../../lib/dateRelative'
import { getAllShitPosts, getShitPostBySlug } from '../../lib/getPost'
import markdownToHtml from '../../lib/markdownToHtml'
import makeDescription from '../../lib/description'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function PostPage({
  post,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <Container>
      <Head>
        <title>{`${post.title} | Tomas Mažvila blog`}</title>
        <meta name="description" content={post.description} key="description" />
        <meta property="og:title" content={post.title} key="og:title" />
        <meta property="og:description" content={post.description} key="og:description" />
        <meta property="og:type" content="article" key="og:type" />
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
    shit: string
  },
  locale: string
}

export async function getStaticProps({ params, locale }: Params) {
  const post = getShitPostBySlug(params.shit, locale, [
    'slug',
    'title',
    'excerpt',
    'date',
    'content',
  ]);

  const description = makeDescription(post.excerpt || post.content || '');

  const content = await markdownToHtml(post.content || '');

  const translationProps = await serverSideTranslations(locale);

  return {
    props: {
      post: {
        ...post,
        content,
        description,
      },
      ...translationProps,
    },
  };
}

export async function getStaticPaths({ locales }) {
  const shitsWithLocales = locales.flatMap((locale: string) => {
    const posts = getAllShitPosts(locale, ['slug'])
    const shitsWithLocales = posts.map(({ slug }) => {
      return {
        slug: slug,
	locale: locale
      };
    })
    return shitsWithLocales;
  })

  const res = {
    paths: shitsWithLocales.map(({ slug, locale }) => {
      return {
        params: {
	  shit: slug 
	},
	locale: locale
      };
    }),
    fallback: false,
  }

  return res;
}

