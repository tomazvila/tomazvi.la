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
	    <div className="relative group">
		  <div className="flex items-center space-x-1 cursor-pointer">
		    <Link href="/shits" className="text-gray-800 hover:text-black">
		      {t("tryda")}
		    </Link>
		    <span className="text-sm">▾</span>
		  </div>

		  <div className="absolute left-0 top-full mt-0 group-hover:flex hidden flex-col bg-white shadow-md rounded-md border border-gray-200 z-50 min-w-[160px]">
		    <Link
		      href="/shits/tagged/investing"
		      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
		    >
		    {t("investing")}
		    </Link>
		    <Link
		      href="/shits/tagged/nerdge"
		      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md"
		    >
		    {t("nerdge")}
		    </Link>
		  </div>
	    </div>

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
