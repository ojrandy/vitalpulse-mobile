import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { useAuthStore } from '../../../../stores/authStore';
import { spacing } from '../../../../theme';

export function BiometricSetupScreen() {
  const { t } = useTranslation('auth');
  const setBiometricLockEnabled = useAuthStore((state) => state.setBiometricLockEnabled);

  const goNext = () => router.push('/(auth)/profile-setup');

  const onEnable = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricLockEnabled(hasHardware && isEnrolled);
    goNext();
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <AppText variant="titleM">{t('biometricSetup.title')}</AppText>
        <AppText variant="bodyM" style={styles.subtitle}>
          {t('biometricSetup.subtitle')}
        </AppText>
      </View>
      <Button label={t('biometricSetup.cta')} onPress={onEnable} />
      <Pressable accessibilityRole="button" onPress={goNext} style={styles.skip}>
        <AppText variant="bodyS">{t('biometricSetup.skip')}</AppText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: spacing['2xs'],
  },
  skip: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
});
