import type { Locale } from './i18n/config';
import { Dictionary } from './i18n/types'; // Import Dictionary type

const dictionaries = {
  en: () => import('../../dictionaries/en.json').then((module) => module.default as Dictionary), // Explicitly cast to Dictionary
  es: () => import('../../dictionaries/es.json').then((module) => module.default as Dictionary), // Explicitly cast to Dictionary
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => // Add return type Promise<Dictionary>
  dictionaries[locale]?.() ?? dictionaries.en();
