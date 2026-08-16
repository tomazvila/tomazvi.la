import 'tailwindcss/tailwind.css'

import type { AppProps } from 'next/app'
import Head from 'next/head'
import Header from '../components/header'
import { appWithTranslation } from 'next-i18next'
import { useRouter } from 'next/router';

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

      <Header/>

      <main className="py-14">
        <Component {...pageProps} />
      </main>
    </>
  )
}

export default appWithTranslation(App)
