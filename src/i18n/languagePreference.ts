import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SupportedLanguage } from './index';

const STORAGE_KEY = 'vitalpulse.languagePreference';

export async function getStoredLanguage(): Promise<SupportedLanguage | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value === 'en' || value === 'fr' ? value : null;
}

export async function setStoredLanguage(language: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, language);
}
