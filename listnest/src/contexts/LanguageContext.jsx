import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS, LANGUAGE_DIRECTIONS, LANGUAGES } from '../data/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Try to get language from localStorage
    const saved = localStorage.getItem('listnest_language');
    if (saved && TRANSLATIONS[saved]) {
      return saved;
    }
    // Default to Hebrew
    return 'he';
  });

  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => {
    return localStorage.getItem('listnest_language_selected') === 'true';
  });

  // Update document direction when language changes
  useEffect(() => {
    const dir = LANGUAGE_DIRECTIONS[language] || 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('listnest_language', language);
  }, [language]);

  const changeLanguage = useCallback((newLang) => {
    if (TRANSLATIONS[newLang]) {
      setLanguage(newLang);
      setHasSelectedLanguage(true);
      localStorage.setItem('listnest_language_selected', 'true');
    }
  }, []);

  // Translation function
  const t = useCallback((key, params = {}) => {
    let text = TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;

    // Replace parameters like {count}, {name}, etc.
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
    });

    return text;
  }, [language]);

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    dir: LANGUAGE_DIRECTIONS[language] || 'ltr',
    isRTL: LANGUAGE_DIRECTIONS[language] === 'rtl',
    hasSelectedLanguage,
    languages: LANGUAGES,
    translations: TRANSLATIONS[language] || TRANSLATIONS['en']
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
