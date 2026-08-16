import 'tailwindcss/tailwind.css'

import type { AppProps } from 'next/app'
import Head from 'next/head'
import Header from '../components/header'
import { appWithTranslation } from 'next-i18next'

function App({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Essays and posts by Tomas Mažvila."
          key="description"
        />
        <title>Tomas Mažvila blog</title>
      </Head>

      {/* Post pages declare where they live in the other locale, if anywhere,
          so the language switcher in the header can route there. */}
      <Header alternates={pageProps.localeAlternates} />

      <main className="py-14">
        <Component {...pageProps} />
      </main>
    </>
  )
}

export default appWithTranslation(App)
