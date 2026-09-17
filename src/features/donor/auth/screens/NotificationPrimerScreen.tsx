import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { IconCircle } from '../../../../components/IconCircle';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { colors, elevation, radii, spacing } from '../../../../theme';

const BENEFIT_KEYS = ['benefit1', 'benefit2', 'benefit3'] as const;

export function NotificationPrimerScreen() {
  const { t } = useTranslation('auth');

  const goNext = () => router.push('/(auth)/biometric');

  const onEnable = async () => {
    await Notifications.requestPermissionsAsync();
    goNext();
  };

  return (
    <ScreenContainer>
      <View style={styles.illustrationWrap}>
        <View style={styles.illustrationCore}>
          <IconCircle name="notifications" size={96} iconSize={40} background="transparent" color={colors.surface.surface} />
        </View>
      </View>

      <AppText variant="titleM" style={styles.title}>
        {t('notificationPrimer.title')}
      </AppText>
      <AppText variant="bodyS" color={colors.text.mutedForeground} style={styles.subtitle}>
        {t('notificationPrimer.subtitle')}
      </AppText>

      <View style={styles.benefits}>
        {BENEFIT_KEYS.map((key) => (
          <View key={key} style={styles.benefitRow}>
            <IconCircle name="checkmark" size={28} iconSize={14} background={colors.status.successSoft} color={colors.status.success} />
            <AppText variant="bodyS" style={styles.benefitText}>
              {t(`notificationPrimer.${key}`)}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      <Button label={t('notificationPrimer.cta')} onPress={onEnable} />
      <Pressable accessibilityRole="button" onPress={goNext} style={styles.skip}>
        <AppText variant="bodyS" color={colors.text.mutedForeground}>
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
    width: 96,
    height: 96,
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
    marginTop: spacing.sm,
  },
  benefits: {
    marginTop: spacing.xl,
    gap: spacing.sm,
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
