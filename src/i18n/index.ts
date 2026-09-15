import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import authEn from './locales/en/auth.json';
import authFr from './locales/fr/auth.json';

const resources = {
  en: { auth: authEn },
  fr: { auth: authFr },
} as const;

const deviceLanguage = Localization.getLocales()[0]?.languageCode;
const supportedLanguage = deviceLanguage === 'fr' ? 'fr' : 'en';

void i18n.use(initReactI18next).init({
  resources,
  lng: supportedLanguage,
  fallbackLng: 'en',
  ns: ['auth'],
  defaultNS: 'auth',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
