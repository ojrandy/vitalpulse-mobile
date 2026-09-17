import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppLockupHeader } from '../../../../components/AppLockupHeader';
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
  const [passwordVisible, setPasswordVisible] = useState(false);
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
      // Facility accounts (hospital staff) — see PhoneEntryScreen's "Sign in
      // with your facility ID" link. Skips the donor-only onboarding
      // (notifications/biometric/profile-setup) since none of that applies
      // to a hospital account. `role` is routing-only, per authStore.ts.
      setSignedIn({ uid, role: 'hospital_staff' });
      router.replace('/(hospital)/(tabs)/inventory');
    } catch {
      setSubmitError(t('otpVerify.errorInvalid'));
    }
  };

  return (
    <ScreenContainer>
      <AppLockupHeader caption={t('login.brandCaption')} />
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
          <View>
            <TextField
              label={t('login.passwordPlaceholder')}
              secureTextEntry={!passwordVisible}
              autoComplete="password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={submitError ?? undefined}
              style={styles.passwordInput}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
              onPress={() => setPasswordVisible((v) => !v)}
              style={styles.eyeButton}
            >
              <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.text.mutedForeground} />
            </Pressable>
          </View>
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
  passwordInput: {
    paddingRight: spacing['2xl'],
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.sm,
    top: 38,
    padding: spacing['2xs'],
  },
  altLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
});
