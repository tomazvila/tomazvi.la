import { useState } from 'react';
import { useRouter } from 'next/router';

type LocaleDropdownProps = {
  translation: string
  // Path of the current page in each other locale, when one exists. Post pages
  // supply this from their `translation` frontmatter key.
  alternates?: Record<string, string>
}

const LANGUAGES = [
  { locale: 'en', label: 'English' },
  { locale: 'lt', label: 'Lietuvių' },
]

export default function LocaleDropdown({ translation, alternates }: LocaleDropdownProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  // Slugs and tags are per-locale, so carrying the current one into another
  // locale asks for a page that was never generated. Use the declared
  // counterpart when there is one; otherwise there is nothing to switch to, so
  // go to the homepage rather than a URL that cannot exist.
  const targetPath = (locale: string) => {
    if (alternates?.[locale]) return alternates[locale]
    return router.pathname.includes('[') ? '/' : router.asPath
  }

  // The router locale is the single source of truth for the language:
  // next-i18next rebuilds its i18n instance from it on every navigation.
  const changeLanguage = (locale: string) => {
    setShowDropdown(false);
    router.push(targetPath(locale), undefined, { locale });
  };

  return (
    <div className="locale-dropdown">
      <button
        type="button"
        className="dropdown-header"
        aria-expanded={showDropdown}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        { translation }
      </button>
      {showDropdown && (
        <div className="dropdown-content">
          {LANGUAGES.map(({ locale, label }) => (
            <button key={locale} onClick={() => changeLanguage(locale)}>
              {label}
            </button>
          ))}
        </div>
      )}
      <style jsx>{`
        .locale-dropdown {
          position: relative;
          display: inline-block;
        }
        .dropdown-header {
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
          font: inherit;
          color: inherit;
        }
        .dropdown-content {
          display: block;
          position: absolute;
          right: 0;
          background-color: #f9f9f9;
          min-width: 100px;
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          z-index: 1;
        }
        .dropdown-content button {
          display: block;
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          border: none;
          background-color: white;
          cursor: pointer;
        }
        .dropdown-content button:hover {
          background-color: #f1f1f1;
        }
      `}</style>
    </div>
  );
};
