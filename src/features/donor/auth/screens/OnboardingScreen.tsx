import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { colors, spacing } from '../../../../theme';

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
      <View style={styles.content}>
        <AppText variant="displayXl" color={colors.brand.primary}>
          {t('splash.tagline')}
        </AppText>
      </View>
      <Button label={t('onboarding.getStarted')} onPress={goToPhoneEntry} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
});
