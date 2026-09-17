import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { WelcomeIllustration } from '../../../../components/illustrations/WelcomeIllustration';
import { colors, radii, spacing } from '../../../../theme';

export function OnboardingScreen() {
  const { t } = useTranslation('auth');

  const goToPhoneEntry = () => router.push('/(auth)/phone');

  return (
    <ScreenContainer>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" onPress={goToPhoneEntry}>
          <AppText variant="bodyM" color={colors.text.mutedForeground}>
            {t('onboarding.skip')}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.centerArea}>
        <View style={styles.illustrationWrap}>
          <WelcomeIllustration size={220} />
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

        <AppText variant="displayL" style={styles.title}>
          {t('onboarding.title')}
        </AppText>
        <AppText variant="bodyM" color={colors.text.mutedForeground} style={styles.subtitle}>
          {t('onboarding.subtitle')}
        </AppText>
      </View>

      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dotActive} />
          <View style={styles.dot} />
        </View>

        <Button
          label={t('onboarding.continue')}
          onPress={goToPhoneEntry}
          style={styles.continueButton}
        />
        <Pressable accessibilityRole="button" onPress={goToPhoneEntry} style={styles.skipButton}>
          <AppText variant="bodyM" color={colors.text.mutedForeground}>
            {t('onboarding.skip')}
          </AppText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'flex-end',
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  badge: {
    position: 'absolute',
    width: 56,
    height: 56,
    backgroundColor: colors.surface.surface,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2f1c1c',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 5,
  },
  badgeBell: {
    top: 4,
    right: -4,
  },
  badgeLocation: {
    left: -8,
    top: 130,
  },
  badgeShield: {
    width: 44,
    height: 44,
    right: 8,
    bottom: 4,
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
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  bottomArea: {
    paddingBottom: spacing.sm,
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
