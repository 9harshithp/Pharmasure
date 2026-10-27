import React, { createContext, useContext, useState, useEffect } from "react";
import {
  SUPPORTED_LANGUAGES,
  getTranslation,
  translateDynamicText,
  getLanguageBCP47,
  loadLanguage,
} from "../utils/translationService";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("pharmasure_lang") || "en";
  });
  const [version, setVersion] = useState(0);

  const clearResidualGoogleTranslateCookies = () => {
    try {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    clearResidualGoogleTranslateCookies();
    localStorage.setItem("pharmasure_lang", currentLanguage);
    document.documentElement.lang = currentLanguage;
    if (currentLanguage !== "en") {
      loadLanguage(currentLanguage).then(() => {
        setVersion((v) => v + 1);
      });
    }
  }, [currentLanguage]);

  const changeLanguage = async (langCode) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) {
      clearResidualGoogleTranslateCookies();
      if (langCode !== "en") {
        await loadLanguage(langCode);
      }
      localStorage.setItem("pharmasure_lang", langCode);
      document.documentElement.lang = langCode;
      setCurrentLanguage(langCode);
      setVersion((v) => v + 1);
    }
  };

  /**
   * Helper function t(key) to get UI translation
   */
  const t = (key) => {
    return getTranslation(key, currentLanguage);
  };

  /**
   * Dynamic text translator via API
   */
  const translate = async (text) => {
    return translateDynamicText(text, currentLanguage);
  };

  const currentLangDetails =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const speechLangCode = getLanguageBCP47(currentLanguage);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        t,
        translate,
        currentLangDetails,
        speechLangCode,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      <div key={`${currentLanguage}-${version}`} style={{ display: "contents" }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
