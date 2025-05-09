import Container from '../../components/container'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

function HomePage() {
  const { t } = useTranslation()
  const changelog = t("changelog")

  return (
    <>
      <Container>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">
	    { changelog }
          </h1>
         <ul>
	    <li>2023-10-09 first blog post on hakyll</li>
	    <li>2023-11-05 next js blog with comments and translations</li>
	    <li>2023-11-19 blog post about war dolphins</li>
	    <li>2023-11-20 blog post about cult of done</li>
	    <li>2023-11-20 diarrhea and changelog section</li>
      <li>2023-11-26 blog post about gypsies</li>
      <li>2023-11-27 removed blog post about gypsies</li>
      <li>2023-12-26 blog post about free speech boundaries</li>
      <li>2023-12-27 removed title photo for faster load speeds</li>
      <li>2023-12-28 diarrhea post about 4chan</li>
      <li>2023-12-30 blog post about 2023 fails</li>
      <li>2025-04-06 dropdown for investing and nerdge in diarrhea section</li>
      <li>2025-04-06 tag support for diarrhea dropdown filtering</li>
      <li>2025-04-06 blog post about trying how to learn how to invest</li>
         </ul>
        </div>
      </Container>
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
