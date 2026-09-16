import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import authEn from './locales/en/auth.json';
import authFr from './locales/fr/auth.json';
import donorEn from './locales/en/donor.json';
import donorFr from './locales/fr/donor.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  en: { auth: authEn, donor: donorEn },
  fr: { auth: authFr, donor: donorFr },
} as const;

const deviceLanguage = Localization.getLocales()[0]?.languageCode;
const supportedLanguage: SupportedLanguage = deviceLanguage === 'fr' ? 'fr' : 'en';

void i18n.use(initReactI18next).init({
  resources,
  lng: supportedLanguage,
  fallbackLng: 'en',
  ns: ['auth', 'donor'],
  defaultNS: 'auth',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
