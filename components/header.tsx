import Link from 'next/link';
import Container from '../components/container';
import LocaleDropdown from '../components/locale-dropdown';
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import shitTags from '../lib/shit-tags.json'

// lib/shit-tags.json is regenerated from post frontmatter at build time and is
// the single registry of shitpost tags: it drives both these links and the
// static paths of pages/shits/tagged/[tag].tsx, so a link here can never point
// at a tag page that was not generated.
const tagsByLocale = shitTags as Record<string, string[]>

type HeaderProps = {
  alternates?: Record<string, string>
}

export default function Header({ alternates }: HeaderProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const translation = t("keisti-kalba")

  const tags = tagsByLocale[router.locale || 'lt'] || []

  return (
    <header className="py-6">
      <Container>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Link href="/">{t("apie")}</Link>
            <Link href="/posts">{t("irasai")}</Link>

            <div className="relative group">
              <div className="flex items-center space-x-1">
                <Link href="/shits" className="text-gray-800 hover:text-black">
                  {t("tryda")}
                </Link>
                {tags.length > 0 ? <span className="text-sm">▾</span> : null}
              </div>

              {tags.length > 0 ? (
                <div className="absolute left-0 top-full mt-0 group-hover:flex hidden flex-col bg-white shadow-md rounded-md border border-gray-200 z-50 min-w-[160px] overflow-hidden">
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/shits/tagged/${tag}`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t(tag)}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <Link href="/changelog">{t("changelog")}</Link>
          </div>
          <div className="flex items-center">
            <LocaleDropdown translation={translation} alternates={alternates} />
          </div>
        </div>
      </Container>
    </header>
  );
}
