// ─── i18n Provider — English/Arabic with RTL support ───
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from './translations/en.json';
import ar from './translations/ar.json';

const translations = { en, ar };
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('wafr-locale') || 'en';
  });

  const isRTL = locale === 'ar';

  useEffect(() => {
    localStorage.setItem('wafr-locale', locale);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale, isRTL]);

  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = translations[locale];
    for (const k of keys) {
      value = value?.[k];
    }
    if (value === undefined) {
      // Fallback to English
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] ?? `{{${k}}}`);
    }
    return value || key;
  }, [locale]);

  const toggleLocale = useCallback(() => {
    setLocale(prev => prev === 'en' ? 'ar' : 'en');
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRTL, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
