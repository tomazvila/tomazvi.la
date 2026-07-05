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
      <li>2023-11-07 blog post about the Kelly criterion and position sizing</li>
	    <li>2023-11-19 blog post about war dolphins</li>
	    <li>2023-11-20 blog post about cult of done</li>
	    <li>2023-11-20 diarrhea and changelog section</li>
      <li>2023-11-26 blog post about gypsies</li>
      <li>2023-11-27 removed blog post about gypsies</li>
      <li>2023-12-26 blog post about free speech boundaries</li>
      <li>2023-12-27 removed title photo for faster load speeds</li>
      <li>2023-12-28 diarrhea post about 4chan</li>
      <li>2023-12-30 blog post about 2023 fails</li>
      <li>2024-01-28 blog post about liquidity ratios in fundamental analysis</li>
      <li>2024-12-17 blog post about brokers not being your best friend</li>
      <li>2025-04-06 dropdown for investing and nerdge in diarrhea section</li>
      <li>2025-04-06 tag support for diarrhea dropdown filtering</li>
      <li>2025-04-06 blog post about trying how to learn how to invest</li>
      <li>2026-07-05 footnotes and embedded video support in posts</li>
      <li>2026-07-05 blog post about AI, my chess transcriber and open models (en)</li>
      <li>2026-07-05 removed blog post about learning to invest</li>
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
