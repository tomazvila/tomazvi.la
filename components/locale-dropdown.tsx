// LocaleDropdown.tsx

import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';


const LocaleDropdown: React.FC<any> = ({ translation }) => {
  const { i18n } = useTranslation();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowDropdown(false); // Close the dropdown after selecting a language
    router.push(router.pathname, router.asPath, { locale: lang });
  };

  return (
    <div className="locale-dropdown">
      <div className="dropdown-header" onClick={() => setShowDropdown(!showDropdown)}>
        { translation }
      </div>
      {showDropdown && (
        <div className="dropdown-content">
          <button onClick={() => changeLanguage('en')}>English</button>
          <button onClick={() => changeLanguage('lt')}>Lietuvių</button>
          {/* Add more buttons for other languages */}
        </div>
      )}
      <style jsx>{`
        .locale-dropdown {
          position: relative;
          display: inline-block;
        }
        .dropdown-header {
          cursor: pointer;
        }
        .dropdown-content {
          display: block;
          position: absolute;
          background-color: #f9f9f9;
          min-width: 100px;
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          z-index: 1;
          display: ${showDropdown ? 'block' : 'none'};
        }
        .dropdown-content button {
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

export default LocaleDropdown;

