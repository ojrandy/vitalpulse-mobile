import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { colors, elevation, radii, spacing } from '../../../../theme';

export function OnboardingScreen() {
  const { t } = useTranslation('auth');

  const goToPhoneEntry = () => router.push('/(auth)/phone');

  return (
    <ScreenContainer>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" onPress={goToPhoneEntry}>
          <AppText variant="bodyS" color={colors.text.mutedForeground}>
            {t('onboarding.skip')}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.illustrationWrap}>
        <View style={styles.illustrationBackdrop}>
          <View style={styles.illustrationInner}>
            <View style={styles.illustrationCore}>
              <Ionicons name="water" size={40} color={colors.surface.surface} />
            </View>
          </View>
        </View>
        <View style={[styles.badge, styles.badgeBell]}>
          <Ionicons name="notifications-outline" size={24} color={colors.text.foreground} />
          <View style={styles.badgeDot}>
            <AppText variant="caption" color={colors.surface.surface} style={styles.badgeDotText}>
              1
            </AppText>
          </View>
        </View>
        <View style={[styles.badge, styles.badgeLocation]}>
          <Ionicons name="location-outline" size={24} color={colors.text.foreground} />
        </View>
        <View style={[styles.badge, styles.badgeShield]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.status.success} />
        </View>
      </View>

      <AppText variant="titleM" style={styles.title}>
        {t('onboarding.title')}
      </AppText>
      <AppText variant="bodyS" color={colors.text.mutedForeground} style={styles.subtitle}>
        {t('onboarding.subtitle')}
      </AppText>

      <View style={styles.spacer} />

      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={styles.dotActive} />
        <View style={styles.dot} />
      </View>

      <Button label={t('onboarding.continue')} onPress={goToPhoneEntry} style={styles.continueButton} />
      <Pressable accessibilityRole="button" onPress={goToPhoneEntry} style={styles.skipButton}>
        <AppText variant="bodyM" color={colors.text.mutedForeground}>
          {t('onboarding.skip')}
        </AppText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'flex-end',
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  illustrationBackdrop: {
    width: 224,
    height: 224,
    borderRadius: radii.full,
    backgroundColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationInner: {
    width: 160,
    height: 160,
    borderRadius: radii.full,
    backgroundColor: colors.surface.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.card,
  },
  illustrationCore: {
    width: 96,
    height: 96,
    borderRadius: radii['2xl'],
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.raised,
  },
  badge: {
    position: 'absolute',
    backgroundColor: colors.surface.surface,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.raised,
  },
  badgeBell: {
    width: 56,
    height: 56,
    top: 4,
    right: 12,
  },
  badgeLocation: {
    width: 56,
    height: 56,
    left: 4,
    top: 130,
  },
  badgeShield: {
    width: 44,
    height: 44,
    right: 24,
    bottom: 10,
  },
  badgeDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDotText: {
    fontWeight: '700',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surface.border,
  },
  dotActive: {
    width: 24,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.brand.primary,
  },
  continueButton: {
    marginBottom: spacing.sm,
  },
  skipButton: {
    alignItems: 'center',
  },
});
