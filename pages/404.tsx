import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Container from '../components/container'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Custom404() {
  const router = useRouter()

  useEffect(() => {
    // A missing post (e.g. one with no version in the switched language) should
    // land the reader on the homepage instead of a dead end.
    const path = router.asPath.split('?')[0]
    if (path.startsWith('/posts/') || path.startsWith('/shits/')) {
      router.replace('/')
    }
  }, [router])

  return (
    <Container>
      <p>
        Not found. <Link href="/">Go to the homepage.</Link>
      </p>
    </Container>
  )
}

export async function getStaticProps({ locale }: { locale?: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'lt')),
    },
  }
}
