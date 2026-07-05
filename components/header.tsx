import Link from 'next/link';
import Container from '../components/container';
import LocaleDropdown from '../components/locale-dropdown';
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import shitTags from '../lib/shit-tags.json'

// All shitpost tag links. Only those that actually have posts for the current
// locale (per lib/shit-tags.json, regenerated at build) are shown.
const SHIT_TAGS = [
  { tag: 'investing', href: '/shits/tagged/investing' },
  { tag: 'nerdge', href: '/shits/tagged/nerdge' },
]

export default function Header() {
  const { t } = useTranslation()
  const router = useRouter()
  const translation = t("keisti-kalba")

  const locale = router.locale || 'lt'
  const activeTags = (shitTags as Record<string, string[]>)[locale] || []
  const visibleTags = SHIT_TAGS.filter((x) => activeTags.includes(x.tag))

  return (
    <header className="py-6">
      <Container>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Link href="/">{t("apie")}</Link>
            <Link href="/posts">{t("irasai")}</Link>
            {visibleTags.length > 0 ? (
              <div className="relative group">
                <div className="flex items-center space-x-1 cursor-pointer">
                  <Link href="/shits" className="text-gray-800 hover:text-black">
                    {t("tryda")}
                  </Link>
                  <span className="text-sm">▾</span>
                </div>

                <div className="absolute left-0 top-full mt-0 group-hover:flex hidden flex-col bg-white shadow-md rounded-md border border-gray-200 z-50 min-w-[160px] overflow-hidden">
                  {visibleTags.map((x) => (
                    <Link
                      key={x.tag}
                      href={x.href}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t(x.tag)}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link href="/shits" className="text-gray-800 hover:text-black">
                {t("tryda")}
              </Link>
            )}

            <Link href="/changelog">{t("changelog")}</Link>
          </div>
          <div className="flex items-center">
            <LocaleDropdown translation={translation} />
          </div>
        </div>
      </Container>
    </header>
  );
}
