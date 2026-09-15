import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { TextField } from '../../../../components/TextField';
import { emailLoginSchema, type EmailLoginInput } from '../../../../schemas/authSchemas';
import { authService } from '../../../../services/authService';
import { useAuthStore } from '../../../../stores/authStore';
import { colors, spacing } from '../../../../theme';

export function LoginScreen() {
  const { t } = useTranslation('auth');
  const setSignedIn = useAuthStore((state) => state.setSignedIn);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EmailLoginInput>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }: EmailLoginInput) => {
    setSubmitError(null);
    try {
      const { uid } = await authService.signInWithEmail(email, password);
      setSignedIn({ uid });
      router.push('/(auth)/notifications');
    } catch {
      setSubmitError(t('otpVerify.errorInvalid'));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="titleM">{t('login.title')}</AppText>
      </View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('login.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('login.passwordPlaceholder')}
            secureTextEntry
            autoComplete="password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={submitError ?? undefined}
          />
        )}
      />
      <Button label={t('login.cta')} loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(auth)/phone')}
        style={styles.altLink}
      >
        <AppText variant="bodyS" color={colors.brand.primary}>
          {t('login.usePhoneInstead')}
        </AppText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  altLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
});
