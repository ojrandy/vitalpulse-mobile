import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { TextField } from '../../../../components/TextField';
import { phoneNumberSchema, type PhoneNumberInput } from '../../../../schemas/authSchemas';
import { authService } from '../../../../services/authService';
import { spacing } from '../../../../theme';

export function PhoneEntryScreen() {
  const { t } = useTranslation('auth');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PhoneNumberInput>({
    resolver: zodResolver(phoneNumberSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = async ({ phone }: PhoneNumberInput) => {
    setSubmitError(null);
    try {
      const { verificationId } = await authService.sendOtp(phone);
      router.push({ pathname: '/(auth)/otp', params: { phone, verificationId } });
    } catch {
      setSubmitError(t('phoneEntry.errorInvalid'));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="titleM">{t('phoneEntry.title')}</AppText>
        <AppText variant="bodyM" style={styles.subtitle}>
          {t('phoneEntry.subtitle')}
        </AppText>
      </View>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('phoneEntry.placeholder')}
            placeholder="+237XXXXXXXXX"
            keyboardType="phone-pad"
            autoComplete="tel"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={
              errors.phone
                ? t(`phoneEntry.${errors.phone.message}` as const)
                : (submitError ?? undefined)
            }
          />
        )}
      />
      <Button label={t('phoneEntry.cta')} loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
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
});
