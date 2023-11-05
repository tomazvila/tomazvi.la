import type { InferGetStaticPropsType } from 'next'
import Link from 'next/link'
import Container from '../../components/container'
import distanceToNow from '../../lib/dateRelative'
import { getAllPosts } from '../../lib/getPost'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function NotePage({
  allPosts,
  locale
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Container>
      {allPosts.length ? (
        allPosts.map((post) => (
          <article key={post.slug} className="mb-10">
            <Link
              href={{
	        pathname: '[locale]/posts/[slug]',
		query: { locale: locale, slug: post.slug },
	      }}
              className="text-lg leading-6 font-bold"
            >
              {post.title}
            </Link>
            <p>{post.excerpt}</p>
            <div className="text-gray-400">
              <time>{distanceToNow(new Date(post.date))}</time>
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
  const allPosts = getAllPosts(locale, ['slug', 'title', 'excerpt', 'date']);

  const translationProps = await serverSideTranslations(locale);

  return {
    props: {
      allPosts,
      locale,
      ...translationProps // Merge translation props into the props object
    }
  };
}
