import Container from '../components/container'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

function HomePage() {
  const { t } = useTranslation()

  return (
    <Container>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('sveiki')}</h1>
        <p>{t('apie-save')}</p>
      </div>
    </Container>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}

export default HomePage
