import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { TextField } from '../../../../components/TextField';
import { otpCodeSchema, type OtpCodeInput } from '../../../../schemas/authSchemas';
import { authService } from '../../../../services/authService';
import { useAuthStore } from '../../../../stores/authStore';
import { colors, spacing } from '../../../../theme';

const RESEND_COOLDOWN_SECONDS = 30;

export function OtpVerifyScreen() {
  const { t } = useTranslation('auth');
  const { phone, verificationId } = useLocalSearchParams<{
    phone: string;
    verificationId: string;
  }>();
  const setSignedIn = useAuthStore((state) => state.setSignedIn);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN_SECONDS);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpCodeInput>({
    resolver: zodResolver(otpCodeSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const onSubmit = async ({ code }: OtpCodeInput) => {
    setSubmitError(null);
    try {
      const { uid } = await authService.verifyOtp(verificationId, code);
      setSignedIn({ uid, phone });
      router.push('/(auth)/notifications');
    } catch {
      setSubmitError(t('otpVerify.errorInvalid'));
    }
  };

  const onResend = async () => {
    setResendSeconds(RESEND_COOLDOWN_SECONDS);
    await authService.sendOtp(phone);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="titleM">{t('otpVerify.title')}</AppText>
        <AppText variant="bodyM" style={styles.subtitle}>
          {t('otpVerify.subtitle', { phone })}
        </AppText>
      </View>
      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('otpVerify.title')}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={
              errors.code
                ? t(`otpVerify.${errors.code.message}` as const)
                : (submitError ?? undefined)
            }
          />
        )}
      />
      <Button label={t('otpVerify.cta')} loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
      <Pressable
        accessibilityRole="button"
        disabled={resendSeconds > 0}
        onPress={onResend}
        style={styles.resend}
      >
        <AppText
          variant="bodyS"
          color={resendSeconds > 0 ? colors.text.mutedForeground : colors.brand.primary}
        >
          {resendSeconds > 0
            ? t('otpVerify.resendIn', { seconds: resendSeconds })
            : t('otpVerify.resend')}
        </AppText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing['2xs'],
  },
  resend: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
});
