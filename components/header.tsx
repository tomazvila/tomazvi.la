import Link from 'next/link';
import Container from '../components/container';
import LocaleDropdown from '../components/locale-dropdown';
import { useTranslation } from 'next-i18next'

export default function Header() {
  const { t } = useTranslation()
  const translation = t("keisti-kalba")

  return (
    <header className="py-6">
      <Container>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Link href="/">{t("apie")}</Link>
            <Link href="/posts">{t("irasai")}</Link>
            <Link href="/shits">{t("tryda")}</Link>
            <Link href="/changelog">{t("changelog")}</Link>
          </div>
          <div className="flex items-center"> {/* Encapsulate LocaleDropdown within a div for styling */}
            <LocaleDropdown translation={translation} />
          </div>
        </div>
      </Container>
    </header>
  );
}
