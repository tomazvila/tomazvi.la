import Container from '../components/container'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

function HomePage() {
  const { t } = useTranslation()
  const sveiki = t("sveiki")
  const apieSave = t("apie-save")

  return (
    <>
      <Container>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">
	    { sveiki }
          </h1>
          <p>
	    { apieSave }
          </p>
        </div>
      </Container>

      <div className="container max-w-4xl m-auto px-4 mt-20">
        <Image
          src="/desk.jpg"
          alt="my desk"
          width={1920 / 2}
          height={1280 / 2}
        />
      </div>
    </>
  )
}

export async function getStaticProps(context) {
  // extract the locale identifier from the URL
  const { locale } = context

  return {
    props: {
      // pass the translation props to the page component
      ...(await serverSideTranslations(locale)),
    },
  }
}

export default HomePage
