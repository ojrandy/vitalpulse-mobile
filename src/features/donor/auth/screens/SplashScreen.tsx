import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppText } from '../../../../components/AppText';
import { VitalPulseMark } from '../../../../components/VitalPulseMark';
import { colors, spacing } from '../../../../theme';

/**
 * Fixed 3s hold for now. Once real connectivity/session-check logic lands,
 * replace this with "advance as soon as that check resolves" instead of a
 * flat timer — see PROJECTTRACKER.md.
 */
const AUTO_ADVANCE_MS = 3000;

export function SplashScreen() {
  const { t } = useTranslation('auth');

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/(auth)/language'), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <VitalPulseMark size={72} />
      <AppText variant="displayL" color={colors.brand.primary} style={styles.wordmark}>
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
  wordmark: {
    marginTop: spacing.sm,
  },
  tagline: {
    marginTop: spacing['2xs'],
  },
});
