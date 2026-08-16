import type { InferGetStaticPropsType } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Container from '../../components/container'
import formatDate from '../../lib/formatDate'
import { posts } from '../../lib/getPost'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function NotePage({
  allPosts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { locale } = useRouter()

  return (
    <Container>
      {allPosts.length ? (
        allPosts.map((post) => (
          <article key={post.slug} className="mb-10">
            <Link
              href={`/posts/${post.slug}`}
              className="text-lg leading-6 font-bold"
            >
              {post.title}
            </Link>
            <div className="text-gray-400">
              <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            </div>
          </article>
        ))
      ) : (
        <p>No blog posted yet :/</p>
      )}
    </Container>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      allPosts: posts.getAll(locale, ['slug', 'title', 'date']),
      ...(await serverSideTranslations(locale)),
    },
  }
}
