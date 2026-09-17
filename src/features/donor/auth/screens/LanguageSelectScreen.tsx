import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { VitalPulseMark } from '../../../../components/VitalPulseMark';
import { setStoredLanguage } from '../../../../i18n/languagePreference';
import type { SupportedLanguage } from '../../../../i18n';
import { colors, radii, spacing } from '../../../../theme';

const OPTIONS: { code: SupportedLanguage; titleKey: string; subtitleKey: string }[] = [
  { code: 'en', titleKey: 'languageSelect.englishTitle', subtitleKey: 'languageSelect.englishSubtitle' },
  { code: 'fr', titleKey: 'languageSelect.frenchTitle', subtitleKey: 'languageSelect.frenchSubtitle' },
];

export function LanguageSelectScreen() {
  const { t, i18n } = useTranslation('auth');
  const [selected, setSelected] = useState<SupportedLanguage>((i18n.language as SupportedLanguage) ?? 'en');

  const onContinue = async () => {
    await i18n.changeLanguage(selected);
    await setStoredLanguage(selected);
    router.push('/(auth)/onboarding');
  };

  return (
    <ScreenContainer>
      <VitalPulseMark />
      <View style={styles.header}>
        <AppText variant="titleM" style={styles.centered}>
          {t('languageSelect.title')}
        </AppText>
        <AppText variant="titleM" style={styles.centered}>
          {t('languageSelect.titleSecondary')}
        </AppText>
      </View>
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isSelected = selected === option.code;
          return (
            <Pressable
              key={option.code}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelected(option.code)}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
              <View style={styles.optionText}>
                <AppText variant="screenTitle">{t(option.titleKey)}</AppText>
                <AppText variant="bodyS" color={colors.text.mutedForeground}>
                  {t(option.subtitleKey)}
                </AppText>
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected ? <Ionicons name="checkmark" size={14} color={colors.surface.surface} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.spacer} />
      <AppText variant="caption" color={colors.text.mutedForeground} style={[styles.centered, styles.hint]}>
        {t('languageSelect.hint')}
      </AppText>
      <Button label={t('languageSelect.cta')} onPress={onContinue} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  centered: {
    textAlign: 'center',
  },
  options: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: colors.surface.border,
    borderRadius: radii['2xl'],
    padding: spacing.md,
  },
  optionSelected: {
    borderColor: colors.brand.primary,
  },
  optionText: {
    flex: 1,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.surface.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  spacer: {
    flex: 1,
  },
  hint: {
    marginBottom: spacing.md,
  },
});
