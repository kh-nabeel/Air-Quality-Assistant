import { useState, useCallback, useEffect } from 'react';
import type { Language } from '@/domain/types';
import { en, type Translations } from './en';
import { hi } from './hi';
import { STORAGE_KEYS } from '@/config/constants';

export type { Translations };
export { en, hi };

const translations: Record<Language, Translations> = { en, hi: hi as unknown as Translations };

/** Get stored language preference or default to English */
function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (stored === 'hi' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

interface UseTranslationReturn {
  readonly t: Translations;
  readonly language: Language;
  readonly setLanguage: (lang: Language) => void;
}

/**
 * Hook for accessing translations and switching language.
 * Persists language preference in localStorage.
 */
export function useTranslation(): UseTranslationReturn {
  const [language, setLangState] = useState<Language>(getStoredLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLangState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return {
    t: translations[language],
    language,
    setLanguage,
  };
}
