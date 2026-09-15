import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { spacing } from '../../../../theme';

export function NotificationPrimerScreen() {
  const { t } = useTranslation('auth');

  const goNext = () => router.push('/(auth)/biometric');

  const onEnable = async () => {
    await Notifications.requestPermissionsAsync();
    goNext();
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <AppText variant="titleM">{t('notificationPrimer.title')}</AppText>
        <AppText variant="bodyM" style={styles.subtitle}>
          {t('notificationPrimer.subtitle')}
        </AppText>
      </View>
      <Button label={t('notificationPrimer.cta')} onPress={onEnable} />
      <Pressable accessibilityRole="button" onPress={goNext} style={styles.skip}>
        <AppText variant="bodyS">{t('notificationPrimer.skip')}</AppText>
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
