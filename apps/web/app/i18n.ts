import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

export const supportedLanguages = ['en', 'es', 'fr'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageLabels: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

const resources = {
  en: {
    translation: {
      title: 'Chess AI',
      bootstrapMessage: 'The platform foundation is running.',
      localeLabel: 'Language',
    },
  },
  es: {
    translation: {
      title: 'Chess AI',
      bootstrapMessage: 'La base de la plataforma está en funcionamiento.',
      localeLabel: 'Idioma',
    },
  },
  fr: {
    translation: {
      title: 'Chess AI',
      bootstrapMessage: 'La base de la plateforme est opérationnelle.',
      localeLabel: 'Langue',
    },
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

export default i18n;
