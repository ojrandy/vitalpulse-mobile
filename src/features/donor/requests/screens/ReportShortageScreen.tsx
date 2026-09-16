import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { BottomActionBar } from '../../../../components/BottomActionBar';
import { Button } from '../../../../components/Button';
import { Card } from '../../../../components/Card';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { TextField } from '../../../../components/TextField';
import { bloodTypeEnum } from '../../../../schemas/profileSchema';
import { reportShortageSchema, type ReportShortageInput } from '../../../../schemas/requestSchemas';
import { requestService } from '../../../../services/requestService';
import { colors, radii, spacing } from '../../../../theme';

const URGENCY_OPTIONS = ['critical', 'urgent', 'routine'] as const;

export function ReportShortageScreen() {
  const { t } = useTranslation('donor');
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportShortageInput>({
    resolver: zodResolver(reportShortageSchema),
    defaultValues: {
      requestType: 'donor_reported_shortage',
      bloodType: 'unknown',
      unitsNeeded: 1,
      city: '',
      urgency: 'urgent',
      patientContext: { notes: '' },
    },
  });

  const onSubmit = async (input: ReportShortageInput) => {
    setSubmitting(true);
    try {
      await requestService.submitRequest(input);
      router.replace('/(donor)/requests');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title={t('reportShortage.headerTitle')} subtitle={t('reportShortage.headerSubtitle')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Card>
          <AppText variant="bodyS" style={styles.label}>
            {t('reportShortage.bloodType')}
          </AppText>
          <Controller
            control={control}
            name="bloodType"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipRow}>
                {bloodTypeEnum.options.map((option) => {
                  const isSelected = value === option;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => onChange(option)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                    >
                      <AppText variant="bodyS" color={isSelected ? colors.surface.surface : colors.text.foreground}>
                        {option}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={t('reportShortage.city')}
                placeholder={t('reportShortage.cityPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.city ? ' ' : undefined}
                style={styles.fieldSpacing}
              />
            )}
          />

          <AppText variant="bodyS" style={styles.label}>
            {t('reportShortage.urgency')}
          </AppText>
          <Controller
            control={control}
            name="urgency"
            render={({ field: { onChange, value } }) => (
              <View style={styles.urgencyRow}>
                {URGENCY_OPTIONS.map((option) => {
                  const isSelected = value === option;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => onChange(option)}
                      style={[styles.urgencyOption, isSelected && styles.urgencySelected]}
                    >
                      <AppText variant="bodyS" color={isSelected ? colors.brand.primary : colors.text.mutedForeground}>
                        {t(`requestBlood.urgency${option.charAt(0).toUpperCase()}${option.slice(1)}` as const)}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />

          <AppText variant="bodyS" style={[styles.label, styles.fieldSpacing]}>
            {t('reportShortage.notes')}
          </AppText>
          <Controller
            control={control}
            name="patientContext.notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textarea}
                placeholder={t('reportShortage.notesPlaceholder')}
                placeholderTextColor={colors.text.mutedForeground}
                multiline
                numberOfLines={3}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </Card>
      </ScrollView>
      <BottomActionBar>
        <Button label={t('reportShortage.submit')} loading={submitting} onPress={handleSubmit(onSubmit)} style={styles.submitButton} />
      </BottomActionBar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  label: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'],
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.surface,
  },
  chipSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  fieldSpacing: {
    marginTop: spacing.md,
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  urgencyOption: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
  },
  urgencySelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primarySoft,
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    padding: spacing.sm,
    minHeight: 72,
    textAlignVertical: 'top',
    color: colors.text.foreground,
    backgroundColor: colors.surface.surface,
  },
  submitButton: {
    flex: 1,
  },
});
