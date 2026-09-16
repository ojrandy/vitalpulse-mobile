import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { Pill } from '../../../../components/Pill';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { BLOOD_COMPATIBILITY } from '../../../../data/bloodCompatibility';
import { mockDonorProfile } from '../../../../data/mockDonorData';
import { colors, radii, spacing } from '../../../../theme';

const BLOOD_TYPES = Object.keys(BLOOD_COMPATIBILITY);

export function BloodCompatibilityScreen() {
  const { t } = useTranslation('donor');
  const [selected, setSelected] = useState<string>(mockDonorProfile.bloodType);
  const info = BLOOD_COMPATIBILITY[selected];

  return (
    <ScreenContainer>
      <ScreenHeader title={t('bloodCompatibility.headerTitle')} subtitle={t('bloodCompatibility.headerSubtitle')} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {BLOOD_TYPES.map((type) => {
            const isSelected = selected === type;
            return (
              <Pressable
                key={type}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelected(type)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <AppText variant="bodyM" color={isSelected ? colors.surface.surface : colors.text.foreground}>
                  {type}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {selected === 'O-' ? <Pill label={t('bloodCompatibility.universalDonor')} tone="success" /> : null}
        {selected === 'AB+' ? <Pill label={t('bloodCompatibility.universalRecipient')} tone="info" /> : null}

        <Card style={styles.section}>
          <AppText variant="sectionLabel" color={colors.text.mutedForeground} style={styles.sectionLabel}>
            {t('bloodCompatibility.canDonateTo')}
          </AppText>
          <View style={styles.badgeRow}>
            {info.canDonateTo.map((type) => (
              <View key={type} style={styles.badge}>
                <AppText variant="bodyS" color={colors.brand.primary} style={styles.bold}>
                  {type}
                </AppText>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <AppText variant="sectionLabel" color={colors.text.mutedForeground} style={styles.sectionLabel}>
            {t('bloodCompatibility.canReceiveFrom')}
          </AppText>
          <View style={styles.badgeRow}>
            {info.canReceiveFrom.map((type) => (
              <View key={type} style={styles.badge}>
                <AppText variant="bodyS" color={colors.brand.primary} style={styles.bold}>
                  {type}
                </AppText>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    width: 56,
    height: 44,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    backgroundColor: colors.brand.primarySoft,
  },
  bold: {
    fontWeight: '700',
  },
});
