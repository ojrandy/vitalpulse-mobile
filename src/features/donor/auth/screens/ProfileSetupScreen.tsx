import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { TextField } from '../../../../components/TextField';
import {
  bloodTypeEnum,
  profileSetupSchema,
  type ProfileSetupInput,
} from '../../../../schemas/profileSchema';
import { colors, radii, spacing } from '../../../../theme';

const BLOOD_TYPE_OPTIONS = bloodTypeEnum.options;

export function ProfileSetupScreen() {
  const { t } = useTranslation('auth');
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ProfileSetupInput>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: { name: '', city: '', bloodType: 'unknown', bloodTypeSource: 'unknown' },
  });

  const selectedBloodType = watch('bloodType');

  const onSelectBloodType = (value: (typeof BLOOD_TYPE_OPTIONS)[number]) => {
    setValue('bloodType', value);
    setValue('bloodTypeSource', value === 'unknown' ? 'unknown' : 'self_reported');
  };

  const onSubmit = async () => {
    // Real submission (writing to `users/{uid}`) lands with the Home screen
    // group once the donor Home route exists — see plan's "out of scope" note.
    router.replace('/(donor)/home');
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="titleM">{t('profileSetup.title')}</AppText>
      </View>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('profileSetup.nameLabel')}
            autoComplete="name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('profileSetup.cityLabel')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      <AppText variant="bodyS" color={colors.text.mutedForeground} style={styles.label}>
        {t('profileSetup.bloodTypeLabel')}
      </AppText>
      <View style={styles.chipRow}>
        {BLOOD_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedBloodType === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectBloodType(option)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <AppText
                variant="bodyS"
                color={isSelected ? colors.surface.surface : colors.text.foreground}
              >
                {option === 'unknown' ? t('profileSetup.bloodTypeUnknown') : option}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {selectedBloodType !== 'unknown' ? (
        <AppText variant="caption" color={colors.text.mutedForeground} style={styles.hint}>
          {t('profileSetup.bloodTypeSourceHint')}
        </AppText>
      ) : null}
      <Button
        label={t('profileSetup.cta')}
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'],
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.surface,
  },
  chipSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  hint: {
    marginBottom: spacing.lg,
  },
});
