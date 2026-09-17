import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { Card } from '../../../../components/Card';
import { IconCircle } from '../../../../components/IconCircle';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { useAuthStore } from '../../../../stores/authStore';
import { colors, elevation, radii, spacing } from '../../../../theme';

export function BiometricSetupScreen() {
  const { t } = useTranslation('auth');
  const setBiometricLockEnabled = useAuthStore((state) => state.setBiometricLockEnabled);
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [requireEveryLaunch, setRequireEveryLaunch] = useState(true);

  const goNext = () => router.push('/(auth)/profile-setup');

  const onEnable = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricLockEnabled(faceIdEnabled && hasHardware && isEnrolled);
    goNext();
  };

  return (
    <ScreenContainer>
      <View style={styles.illustrationWrap}>
        <View style={styles.illustrationCore}>
          <IconCircle name="lock-closed" size={96} iconSize={40} background="transparent" color={colors.surface.surface} />
        </View>
      </View>

      <AppText variant="titleM" style={styles.title}>
        {t('biometricSetup.title')}
      </AppText>
      <AppText variant="bodyS" color={colors.text.mutedForeground} style={styles.subtitle}>
        {t('biometricSetup.subtitle')}
      </AppText>

      <Card style={styles.togglesCard}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <AppText variant="bodyM" style={styles.bold}>
              {t('biometricSetup.faceIdLabel')}
            </AppText>
            <AppText variant="caption" color={colors.text.mutedForeground}>
              {t('biometricSetup.faceIdHint')}
            </AppText>
          </View>
          <Switch
            value={faceIdEnabled}
            onValueChange={setFaceIdEnabled}
            trackColor={{ true: colors.brand.primary, false: colors.surface.border }}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.toggleRow}>
          <AppText variant="bodyM" style={[styles.bold, styles.toggleText]}>
            {t('biometricSetup.requireEveryLaunch')}
          </AppText>
          <Switch
            value={requireEveryLaunch}
            onValueChange={setRequireEveryLaunch}
            disabled={!faceIdEnabled}
            trackColor={{ true: colors.brand.primary, false: colors.surface.border }}
          />
        </View>
      </Card>

      <View style={styles.spacer} />

      <Button label={t('biometricSetup.cta')} onPress={onEnable} />
      <Pressable accessibilityRole="button" onPress={goNext} style={styles.skip}>
        <AppText variant="bodyS" color={colors.text.mutedForeground}>
          {t('biometricSetup.skip')}
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
  togglesCard: {
    marginTop: spacing.xl,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  toggleText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  bold: {
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.border,
    marginVertical: spacing.xs,
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
