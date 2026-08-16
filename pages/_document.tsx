import { Html, Head, Main, NextScript } from 'next/document'
import type { DocumentProps } from 'next/document'
import i18nextConfig from '../next-i18next.config'

export default function Document(props: DocumentProps) {
  // The document language is the router locale, not a literal: most of this
  // blog is Lithuanian, and a hardcoded lang tells screen readers, hyphenation
  // and translation prompts the wrong thing on every one of those pages.
  const locale = props.__NEXT_DATA__.locale ?? i18nextConfig.i18n.defaultLocale

  return (
    <Html lang={locale}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="robots" content="follow, index" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </Head>
      <body className="bg-white text-gray-700 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
