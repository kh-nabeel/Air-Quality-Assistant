import { useState, useCallback, useEffect } from 'react';
import type { Language } from '@/domain/types';
import { en, type Translations } from './en';
import { hi } from './hi';
import { STORAGE_KEYS } from '@/config/constants';

/** Re-exported translation type for external consumers. */
export type { Translations };

/** Re-exported English translation strings. */
export { en };

/** Re-exported Hindi translation strings. */
export { hi };

/** Map of language codes to their corresponding translation objects. */
const translations: Record<Language, Translations> = { en, hi: hi as unknown as Translations };

/** Get stored language preference from localStorage, defaulting to English. */
function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (stored === 'hi' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

/** Return type of the {@link useTranslation} hook. */
interface UseTranslationReturn {
  /** The active translation object. */
  readonly t: Translations;
  /** The currently selected language code. */
  readonly language: Language;
  /** Callback to switch the active language and persist the choice. */
  readonly setLanguage: (lang: Language) => void;
}

/**
 * Hook for accessing translations and switching the active language.
 *
 * The selected language is persisted in `localStorage` and the `<html lang>`
 * attribute is kept in sync.
 *
 * @returns An object containing the translation strings, current language, and
 *   a setter to change language.
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
