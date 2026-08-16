import Link from 'next/link'
import Container from '../components/container'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

// This page used to redirect anything under /posts/ or /shits/ to the homepage,
// to hide the 404 the language switcher produced. The switcher no longer sends
// readers to URLs that cannot exist, so a 404 can mean 404 again — a retired
// post or a typo now says so instead of silently teleporting the reader.
export default function Custom404() {
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
