import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import adminEn from './locales/en/admin.json';
import adminFr from './locales/fr/admin.json';
import authEn from './locales/en/auth.json';
import authFr from './locales/fr/auth.json';
import donorEn from './locales/en/donor.json';
import donorFr from './locales/fr/donor.json';
import hospitalEn from './locales/en/hospital.json';
import hospitalFr from './locales/fr/hospital.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  en: { auth: authEn, donor: donorEn, hospital: hospitalEn, admin: adminEn },
  fr: { auth: authFr, donor: donorFr, hospital: hospitalFr, admin: adminFr },
} as const;

const deviceLanguage = Localization.getLocales()[0]?.languageCode;
const supportedLanguage: SupportedLanguage = deviceLanguage === 'fr' ? 'fr' : 'en';

void i18n.use(initReactI18next).init({
  resources,
  lng: supportedLanguage,
  fallbackLng: 'en',
  ns: ['auth', 'donor', 'hospital', 'admin'],
  defaultNS: 'auth',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
