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
import { StepperControl } from '../../../../components/StepperControl';
import { TextField } from '../../../../components/TextField';
import { bloodTypeEnum } from '../../../../schemas/profileSchema';
import { requestBloodSchema, type RequestBloodInput } from '../../../../schemas/requestSchemas';
import { requestService } from '../../../../services/requestService';
import { colors, radii, spacing } from '../../../../theme';

const STEPS = ['stepPatient', 'stepHospital', 'stepReview'] as const;
const URGENCY_OPTIONS = ['critical', 'urgent', 'routine'] as const;
const BLOOD_TYPE_OPTIONS = bloodTypeEnum.options.filter((option) => option !== 'unknown');

export function RequestBloodScreen() {
  const { t } = useTranslation('donor');
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RequestBloodInput>({
    resolver: zodResolver(requestBloodSchema),
    defaultValues: {
      requestType: 'donor_directed_patient',
      bloodType: 'AB+',
      unitsNeeded: 2,
      hospitalId: '',
      city: '',
      urgency: 'urgent',
      patientContext: { notes: '' },
    },
  });

  const values = watch();

  const goNext = async () => {
    const fieldsPerStep: (keyof RequestBloodInput)[][] = [
      ['bloodType'],
      ['unitsNeeded', 'hospitalId', 'city', 'urgency'],
      [],
    ];
    const valid = await trigger(fieldsPerStep[step]);
    if (!valid) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const goBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep(step - 1);
  };

  const onSubmit = async (input: RequestBloodInput) => {
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
      <ScreenHeader title={t('requestBlood.headerTitle')} subtitle={t('requestBlood.headerSubtitle')} onBack={goBack} />

      <View style={styles.progressRow}>
        {STEPS.map((stepKey, index) => (
          <View key={stepKey} style={styles.progressItem}>
            <View style={[styles.progressBar, index <= step && styles.progressBarActive]} />
            <AppText variant="caption" color={index <= step ? colors.brand.primary : colors.text.mutedForeground}>
              {t(`requestBlood.${stepKey}`)}
            </AppText>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {step === 0 ? (
          <Card>
            <AppText variant="bodyS" style={styles.label}>
              {t('requestBlood.patientBloodType')}
            </AppText>
            <Controller
              control={control}
              name="bloodType"
              render={({ field: { onChange, value } }) => (
                <View style={styles.chipRow}>
                  {BLOOD_TYPE_OPTIONS.map((option) => {
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
            <AppText variant="caption" color={colors.text.mutedForeground} style={styles.hint}>
              {t('requestBlood.bloodTypeHint')}
            </AppText>
          </Card>
        ) : null}

        {step === 1 ? (
          <Card>
            <AppText variant="bodyS" style={styles.label}>
              {t('requestBlood.unitsNeeded')}
            </AppText>
            <Controller
              control={control}
              name="unitsNeeded"
              render={({ field: { onChange, value } }) => (
                <StepperControl value={value} onChange={onChange} unitLabel={t('requestBlood.unitsSuffix')} />
              )}
            />

            <Controller
              control={control}
              name="hospitalId"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label={t('requestBlood.hospital')}
                  placeholder={t('requestBlood.hospitalPlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.hospitalId ? ' ' : undefined}
                  style={styles.fieldSpacing}
                />
              )}
            />
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label={t('requestBlood.city')}
                  placeholder={t('requestBlood.cityPlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.city ? ' ' : undefined}
                />
              )}
            />

            <AppText variant="bodyS" style={styles.label}>
              {t('requestBlood.urgency')}
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
                        style={[
                          styles.urgencyOption,
                          isSelected && option === 'urgent' && styles.urgencyUrgentSelected,
                          isSelected && option !== 'urgent' && styles.urgencySelected,
                        ]}
                      >
                        <AppText
                          variant="bodyS"
                          color={isSelected && option === 'urgent' ? colors.status.warning : colors.text.mutedForeground}
                        >
                          {t(`requestBlood.urgency${option.charAt(0).toUpperCase()}${option.slice(1)}` as const)}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />

            <AppText variant="bodyS" style={[styles.label, styles.fieldSpacing]}>
              {t('requestBlood.context')}
            </AppText>
            <Controller
              control={control}
              name="patientContext.notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textarea}
                  placeholder={t('requestBlood.contextPlaceholder')}
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
        ) : null}

        {step === 2 ? (
          <Card>
            <AppText variant="titleM" style={styles.fieldSpacing}>
              {t('requestBlood.reviewSummaryTitle')}
            </AppText>
            <ReviewRow label={t('requestBlood.patientBloodType')} value={values.bloodType} />
            <ReviewRow label={t('requestBlood.unitsNeeded')} value={`${values.unitsNeeded}`} />
            <ReviewRow label={t('requestBlood.hospital')} value={values.hospitalId} />
            <ReviewRow label={t('requestBlood.city')} value={values.city} />
            <ReviewRow
              label={t('requestBlood.urgency')}
              value={t(`requestBlood.urgency${values.urgency.charAt(0).toUpperCase()}${values.urgency.slice(1)}` as const)}
            />
          </Card>
        ) : null}

        <View style={styles.noticeCard}>
          <View style={styles.noticeDot} />
          <AppText variant="bodyS" color={colors.status.info} style={styles.bold}>
            {t('requestBlood.reviewNotice')}
          </AppText>
        </View>
      </ScrollView>

      <BottomActionBar>
        <Button variant="secondary" label={t('requestBlood.back')} onPress={goBack} style={styles.backButton} />
        {step < STEPS.length - 1 ? (
          <Button label={t('requestBlood.continue')} onPress={goNext} style={styles.flexButton} />
        ) : (
          <Button
            label={t('requestBlood.submit')}
            loading={submitting}
            onPress={handleSubmit(onSubmit)}
            style={styles.flexButton}
          />
        )}
      </BottomActionBar>
    </ScreenContainer>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <AppText variant="bodyS" color={colors.text.mutedForeground}>
        {label}
      </AppText>
      <AppText variant="bodyS" style={styles.bold}>
        {value || '—'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressItem: {
    flex: 1,
    gap: spacing['2xs'],
  },
  progressBar: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surface.border,
  },
  progressBarActive: {
    backgroundColor: colors.brand.primary,
  },
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
  hint: {
    marginTop: spacing.sm,
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
    borderColor: colors.text.foreground,
  },
  urgencyUrgentSelected: {
    backgroundColor: colors.status.warningSoft,
    borderColor: colors.status.warning,
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
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.status.infoSoft,
    borderWidth: 1,
    borderColor: 'rgba(47,110,158,0.2)',
    borderRadius: radii.xl,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noticeDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.status.info,
  },
  bold: {
    fontWeight: '700',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing['2xs'],
  },
  backButton: {
    flex: 1,
  },
  flexButton: {
    flex: 2,
  },
});
