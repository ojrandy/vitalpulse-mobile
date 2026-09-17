import {
  getCountries,
  getCountryCallingCode,
  validatePhoneNumberLength,
  type CountryCode,
} from 'libphonenumber-js';

export interface Country {
  /** ISO 3166-1 alpha-2 code, e.g. "CM". */
  code: CountryCode;
  /** E.164 calling code without the leading "+", e.g. "237". */
  callingCode: string;
  /** Unicode regional-indicator flag, e.g. "🇨🇲". */
  flag: string;
  /** Locale-aware display name, e.g. "Cameroon" / "Cameroun". */
  name: string;
}

/** Cameroon — matches the app's original single-country default. */
export const DEFAULT_COUNTRY_CODE: CountryCode = 'CM';

function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/**
 * `Intl.DisplayNames` is a standard, Hermes-supported JS engine API (no extra
 * dependency needed for country names) — but it's wrapped in a try/catch and
 * falls back to the raw ISO code so a picker still renders on an engine
 * without it, rather than crashing the phone-entry screen.
 */
function resolveDisplayNames(locale: string): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' });
  } catch {
    return null;
  }
}

/** Every ISO country libphonenumber-js knows a calling code for, sorted by localized name. */
export function buildCountryList(locale: string): Country[] {
  const displayNames = resolveDisplayNames(locale);

  return getCountries()
    .map((code) => ({
      code,
      callingCode: getCountryCallingCode(code),
      flag: flagEmoji(code),
      name: displayNames?.of(code) ?? code,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** undefined = valid length; otherwise 'TOO_SHORT' | 'TOO_LONG' | 'INVALID_LENGTH' | 'NOT_A_NUMBER'. */
export function checkNationalNumberLength(nationalDigits: string, country: CountryCode) {
  return validatePhoneNumberLength(nationalDigits, country);
}
