import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppText } from '../../../../components/AppText';
import { colors, spacing } from '../../../../theme';

const AUTO_ADVANCE_MS = 1200;

export function SplashScreen() {
  const { t } = useTranslation('auth');

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/(auth)/onboarding'), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <AppText variant="displayL" color={colors.brand.primary}>
        VitalPulse
      </AppText>
      <AppText variant="bodyM" color={colors.text.mutedForeground} style={styles.tagline}>
        {t('splash.tagline')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.background,
    gap: spacing.xs,
  },
  tagline: {
    marginTop: spacing['2xs'],
  },
});
