import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

type LanguageCode = 'pl' | 'en' | 'de' | 'zh' | 'ko';

interface LanguageOption {
  code: LanguageCode;
  label: string;
}

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  availableLanguages: LanguageOption[];
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'pl', label: 'Polski' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
];

const translationModules = import.meta.glob('../translations/*.json', { eager: true }) as Record<
  string,
  any
>;
const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {},
  pl: {},
  de: {},
  zh: {},
  ko: {},
};
for (const path in translationModules) {
  const mod = translationModules[path];
  const match = path.match(/\/([a-z]{2})\.json$/);
  const code = (match?.[1] ?? '') as LanguageCode;
  if (code && code in TRANSLATIONS) {
    TRANSLATIONS[code] = (mod?.default ?? mod) as Record<string, string>;
  }
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'pl' || saved === 'en' || saved === 'de' || saved === 'zh' || saved === 'ko') {
      return saved as LanguageCode;
    }
    return 'pl';
  });
  const [translations, setTranslations] = useState<Record<string, string>>(
    TRANSLATIONS[language] ?? TRANSLATIONS.en
  );

  useEffect(() => {
    setTranslations(TRANSLATIONS[language] ?? TRANSLATIONS.en);
  }, [language]);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    try {
      localStorage.setItem('app_language', code);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return translations[key] ?? fallback ?? key;
    },
    [translations]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      availableLanguages: LANGUAGE_OPTIONS,
      t,
    }),
    [language, t, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export { LanguageContext };
export type { LanguageCode, LanguageContextValue, LanguageOption };
