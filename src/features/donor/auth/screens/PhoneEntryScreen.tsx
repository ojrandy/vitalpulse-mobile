import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppLockupHeader } from '../../../../components/AppLockupHeader';
import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { PhoneIllustration } from '../../../../components/illustrations/PhoneIllustration';
import { phoneNumberSchema, type PhoneNumberInput } from '../../../../schemas/authSchemas';
import { authService } from '../../../../services/authService';
import { colors, radii, spacing } from '../../../../theme';
import { CountryPickerModal } from '../components/CountryPickerModal';
import {
  buildCountryList,
  checkNationalNumberLength,
  DEFAULT_COUNTRY_CODE,
  type Country,
} from '../utils/countries';

export function PhoneEntryScreen() {
  const { t, i18n } = useTranslation('auth');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lengthError, setLengthError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const countries = useMemo(() => buildCountryList(i18n.language), [i18n.language]);
  const [country, setCountry] = useState<Country>(
    () => countries.find((item) => item.code === DEFAULT_COUNTRY_CODE) ?? countries[0],
  );
  const dialPrefix = `+${country.callingCode}`;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PhoneNumberInput>({
    resolver: zodResolver(phoneNumberSchema),
    defaultValues: { phone: '' },
  });

  const selectCountry = (next: Country) => {
    setCountry(next);
    setLengthError(null);
    setSubmitError(null);
    setValue('phone', '', { shouldValidate: false });
  };

  const onSubmit = async ({ phone }: PhoneNumberInput) => {
    setSubmitError(null);
    const digits = phone.slice(dialPrefix.length);
    const lengthStatus = checkNationalNumberLength(digits, country.code);
    if (lengthStatus === 'TOO_LONG') {
      setLengthError(t('phoneEntry.errorTooLong'));
      return;
    }
    if (lengthStatus) {
      setLengthError(t('phoneEntry.errorTooShort'));
      return;
    }
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

      <View style={styles.illustrationWrap}>
        <PhoneIllustration size={150} />
      </View>

      <View style={styles.header}>
        <AppText variant="displayL" style={styles.title}>
          {t('phoneEntry.title')}
        </AppText>
        <AppText variant="bodyM" color={colors.text.mutedForeground} style={styles.subtitle}>
          {t('phoneEntry.subtitle')}
        </AppText>
      </View>

      <AppText variant="bodyM" style={styles.label}>
        {t('phoneEntry.placeholder')}
      </AppText>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => {
          const national = value.startsWith(dialPrefix) ? value.slice(dialPrefix.length) : value;
          return (
            <View style={[styles.inputRow, (errors.phone || lengthError) && styles.inputRowError]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('phoneEntry.countryPickerTitle')}
                style={styles.dialCodeChip}
                onPress={() => setPickerOpen(true)}
              >
                <AppText variant="bodyM" style={styles.flag}>
                  {country.flag}
                </AppText>
                <AppText variant="bodyM" style={styles.bold}>
                  {dialPrefix}
                </AppText>
                <Ionicons name="chevron-down" size={14} color={colors.text.mutedForeground} />
              </Pressable>
              <View style={styles.divider} />
              <TextInput
                style={styles.input}
                placeholderTextColor={colors.text.mutedForeground}
                keyboardType="phone-pad"
                autoComplete="tel"
                value={national}
                onChangeText={(text) => {
                  const digits = text.replace(/[^\d]/g, '');
                  const status = checkNationalNumberLength(digits, country.code);
                  if (status === 'TOO_LONG') {
                    setLengthError(t('phoneEntry.errorTooLong'));
                    return;
                  }
                  setLengthError(null);
                  onChange(`${dialPrefix}${digits}`);
                }}
                onBlur={onBlur}
              />
            </View>
          );
        }}
      />
      {lengthError || errors.phone || submitError ? (
        <AppText variant="bodyS" color={colors.status.warning} style={styles.errorText}>
          {lengthError ??
            (errors.phone ? t(`phoneEntry.${errors.phone.message}` as const) : submitError)}
        </AppText>
      ) : null}

      <AppText variant="bodyS" color={colors.text.mutedForeground} style={styles.terms}>
        {t('phoneEntry.termsPrefix')}{' '}
        <AppText variant="bodyS" color={colors.brand.primary} style={styles.bold}>
          {t('phoneEntry.termsOfService')}
        </AppText>{' '}
        {t('phoneEntry.and')}{' '}
        <AppText variant="bodyS" color={colors.brand.primary} style={styles.bold}>
          {t('phoneEntry.privacyPolicy')}
        </AppText>
        .
      </AppText>

      <View style={styles.spacer} />

      <Button label={t('phoneEntry.cta')} loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(auth)/login')}
        style={styles.facilityLink}
      >
        <AppText variant="bodyM" color={colors.text.mutedForeground}>
          {t('phoneEntry.hospitalStaffPrompt')}{' '}
          <AppText variant="bodyM" color={colors.brand.primary} style={styles.bold}>
            {t('phoneEntry.hospitalStaffCta')}
          </AppText>
        </AppText>
      </Pressable>

      <CountryPickerModal
        visible={pickerOpen}
        countries={countries}
        selectedCode={country.code}
        onSelect={selectCountry}
        onClose={() => setPickerOpen(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  illustrationWrap: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  label: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.surfaceSunken,
  },
  flag: {
    fontSize: 22,
  },
  bold: {
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.surface.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    fontSize: 22,
    color: colors.text.foreground,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  terms: {
    marginTop: spacing.sm,
    lineHeight: 20,
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
