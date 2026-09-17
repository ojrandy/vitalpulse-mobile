/**
 * Design tokens pulled from the Figma "Foundations" section (vital_pulse file,
 * node 150001:1892 and its Color tokens / Typography child frames).
 * Keep this file the single source of truth — don't hardcode hex values in screens.
 */

export const colors = {
  brand: {
    primary: '#c12535',
    primaryDeep: '#80041a',
    primarySoft: '#ffe9e8',
  },
  surface: {
    canvas: '#f0ece9',
    background: '#fffdfb',
    surface: '#ffffff',
    surfaceSunken: '#f9f6f3',
    mutedSurface: '#f7f4f1',
    border: '#e6e2df',
  },
  text: {
    foreground: '#261b1a',
    mutedForeground: '#786d6a',
  },
  status: {
    success: '#14764a',
    successSoft: '#def8e7',
    warning: '#bb731b',
    warningSoft: '#ffefd1',
    info: '#2f6e9e',
    infoSoft: '#e1f3ff',
  },
} as const;

/** 4px base grid. Mobile gutters 20px, desktop gutters 32px. */
export const spacing = {
  '2xs': 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 64,
} as const;

export const radii = {
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 999,
} as const;

/** React Native shadow props approximating the Figma elevation tokens (single-layer, no CSS multi-shadow support). */
export const elevation = {
  card: {
    shadowColor: '#2f1c1c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 3,
  },
  raised: {
    shadowColor: '#2f1c1c',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 6,
  },
  artboard: {
    shadowColor: '#1e1212',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.22,
    shadowRadius: 80,
    elevation: 12,
  },
} as const;

export const fontFamily = {
  displayExtraBold: 'PlusJakartaSans_800ExtraBold',
  displayBold: 'PlusJakartaSans_700Bold',
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

/**
 * Font size / line height / letter spacing. Originally taken from the Figma
 * Typography foundation card, then scaled up across the board — the Figma
 * sizes were a starting reference, not a spec to match pixel-for-pixel, and
 * they read too small once the app was actually running on a phone.
 * Letter-spacing keeps the same spacing-to-size ratio the Figma tokens used.
 */
export const typeScale = {
  displayXl: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -0.9,
  },
  displayL: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.7,
  },
  titleM: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.48,
  },
  screenTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.38,
  },
  sectionLabel: {
    fontFamily: fontFamily.displayBold,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.7,
    textTransform: 'uppercase' as const,
  },
  bodyM: { fontFamily: fontFamily.bodyRegular, fontSize: 17, lineHeight: 24, letterSpacing: 0 },
  bodyS: { fontFamily: fontFamily.bodyRegular, fontSize: 15, lineHeight: 21, letterSpacing: 0 },
  caption: { fontFamily: fontFamily.bodyRegular, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  numeric: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 34,
    lineHeight: 50,
    letterSpacing: -0.7,
  },
} as const;
