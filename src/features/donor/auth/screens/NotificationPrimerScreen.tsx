import Constants, { ExecutionEnvironment } from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { IconCircle } from '../../../../components/IconCircle';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { colors, elevation, radii, spacing } from '../../../../theme';

const BENEFIT_KEYS = ['benefit1', 'benefit2', 'benefit3'] as const;

/**
 * `expo-notifications`' remote-push functionality was removed from Expo Go
 * on Android starting SDK 53 — the native module throws as soon as it's
 * imported there, not just when a push-specific API is called (Expo's own
 * guidance: use a development build instead). A static top-level import
 * would crash this screen for every Expo Go tester, so it's loaded
 * dynamically and only outside Expo Go; inside Expo Go we skip straight to
 * the next onboarding step instead of failing the whole screen.
 */
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function NotificationPrimerScreen() {
  const { t } = useTranslation('auth');

  const goNext = () => router.push('/(auth)/biometric');

  /** Clicking "Enable notifications" triggers the OS-level permission prompt via expo-notifications. */
  const onEnable = async () => {
    if (isExpoGo) {
      goNext();
      return;
    }
    const Notifications = await import('expo-notifications');
    await Notifications.requestPermissionsAsync();
    goNext();
  };

  return (
    <ScreenContainer>
      <View style={styles.illustrationWrap}>
        <View style={styles.illustrationCore}>
          <IconCircle
            name="notifications"
            size={120}
            iconSize={52}
            background="transparent"
            color={colors.surface.surface}
          />
        </View>
      </View>

      <AppText variant="displayL" style={styles.title}>
        {t('notificationPrimer.title')}
      </AppText>
      <AppText variant="bodyM" color={colors.text.mutedForeground} style={styles.subtitle}>
        {t('notificationPrimer.subtitle')}
      </AppText>

      <View style={styles.benefits}>
        {BENEFIT_KEYS.map((key) => (
          <View key={key} style={styles.benefitRow}>
            <IconCircle
              name="checkmark"
              size={32}
              iconSize={16}
              background={colors.status.successSoft}
              color={colors.status.success}
            />
            <AppText variant="bodyM" style={styles.benefitText}>
              {t(`notificationPrimer.${key}`)}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      <Button label={t('notificationPrimer.cta')} onPress={onEnable} />
      <Pressable accessibilityRole="button" onPress={goNext} style={styles.skip}>
        <AppText variant="bodyM" color={colors.text.mutedForeground}>
          {t('notificationPrimer.skip')}
        </AppText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  illustrationWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  illustrationCore: {
    width: 120,
    height: 120,
    borderRadius: radii['2xl'],
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.raised,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
  benefits: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitText: {
    flex: 1,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.lg,
  },
  skip: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
});
