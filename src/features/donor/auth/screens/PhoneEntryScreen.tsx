import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppLockupHeader } from '../../../../components/AppLockupHeader';
import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { phoneNumberSchema, type PhoneNumberInput } from '../../../../schemas/authSchemas';
import { authService } from '../../../../services/authService';
import { colors, radii, spacing } from '../../../../theme';

const COUNTRY_DIAL_CODE = '+237';

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
      <AppLockupHeader caption={t('phoneEntry.brandCaption')} />
      <View style={styles.header}>
        <AppText variant="titleM">{t('phoneEntry.title')}</AppText>
        <AppText variant="bodyS" color={colors.text.mutedForeground} style={styles.subtitle}>
          {t('phoneEntry.subtitle')}
        </AppText>
      </View>

      <AppText variant="bodyS" style={styles.label}>
        {t('phoneEntry.placeholder')}
      </AppText>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => {
          const national = value.startsWith(COUNTRY_DIAL_CODE) ? value.slice(COUNTRY_DIAL_CODE.length) : value;
          return (
            <View style={[styles.inputRow, errors.phone && styles.inputRowError]}>
              <View style={styles.dialCodeChip}>
                <AppText variant="bodyM">🇨🇲</AppText>
                <AppText variant="bodyS" style={styles.bold}>
                  {COUNTRY_DIAL_CODE}
                </AppText>
              </View>
              <View style={styles.divider} />
              <TextInput
                style={styles.input}
                placeholder="6 78 45 12 09"
                placeholderTextColor={colors.text.mutedForeground}
                keyboardType="phone-pad"
                autoComplete="tel"
                value={national}
                onChangeText={(text) => onChange(`${COUNTRY_DIAL_CODE}${text.replace(/[^\d]/g, '')}`)}
                onBlur={onBlur}
              />
            </View>
          );
        }}
      />
      {errors.phone || submitError ? (
        <AppText variant="caption" color={colors.status.warning} style={styles.errorText}>
          {errors.phone ? t(`phoneEntry.${errors.phone.message}` as const) : submitError}
        </AppText>
      ) : null}

      <AppText variant="caption" color={colors.text.mutedForeground} style={styles.terms}>
        {t('phoneEntry.termsPrefix')} <AppText variant="caption" color={colors.brand.primary} style={styles.bold}>{t('phoneEntry.termsOfService')}</AppText>{' '}
        {t('phoneEntry.and')} <AppText variant="caption" color={colors.brand.primary} style={styles.bold}>{t('phoneEntry.privacyPolicy')}</AppText>.
      </AppText>

      <View style={styles.spacer} />

      <Button label={t('phoneEntry.cta')} loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(auth)/login')}
        style={styles.facilityLink}
      >
        <AppText variant="bodyS" color={colors.text.mutedForeground}>
          {t('phoneEntry.hospitalStaffPrompt')}{' '}
          <AppText variant="bodyS" color={colors.brand.primary} style={styles.bold}>
            {t('phoneEntry.hospitalStaffCta')}
          </AppText>
        </AppText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  subtitle: {
    marginTop: spacing['2xs'],
  },
  label: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface.border,
    borderRadius: radii.xl,
    backgroundColor: colors.surface.surface,
  },
  inputRowError: {
    borderColor: colors.brand.primary,
  },
  dialCodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
    margin: spacing['2xs'],
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.surfaceSunken,
  },
  bold: {
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.surface.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    fontSize: 16,
    color: colors.text.foreground,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  terms: {
    marginTop: spacing.sm,
    lineHeight: 18.5,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
  facilityLink: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
