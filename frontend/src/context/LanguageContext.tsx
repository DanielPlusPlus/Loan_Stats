import { createContext, useMemo, useState, type ReactNode } from "react";

type LanguageCode = "pl" | "en" | "de" | "zh" | "ko";

interface LanguageOption {
  code: LanguageCode;
  label: string;
}

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  availableLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "pl", label: "Polski" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" },
];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageCode>("pl");

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      availableLanguages: LANGUAGE_OPTIONS,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext };
export type { LanguageCode, LanguageContextValue, LanguageOption };
