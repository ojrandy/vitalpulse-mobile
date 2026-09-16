import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { IconCircle } from '../../../../components/IconCircle';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { mockDonorProfile } from '../../../../data/mockDonorData';
import { colors, radii, spacing } from '../../../../theme';

export function BadgesScreen() {
  const { t } = useTranslation('donor');

  return (
    <ScreenContainer>
      <ScreenHeader title={t('badges.headerTitle')} subtitle={t('badges.headerSubtitle')} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <AppText variant="numeric" color={colors.brand.primary}>
              {mockDonorProfile.points}
            </AppText>
            <AppText variant="bodyS" color={colors.text.mutedForeground}>
              {t('badges.pointsLabel')}
            </AppText>
          </Card>
          <Card style={styles.statCard}>
            <AppText variant="titleM">{mockDonorProfile.tier}</AppText>
            <AppText variant="bodyS" color={colors.text.mutedForeground}>
              {t('badges.tierLabel')}
            </AppText>
          </Card>
        </View>

        <AppText variant="sectionLabel" color={colors.text.mutedForeground} style={styles.sectionLabel}>
          {t('badges.earnedBadges')}
        </AppText>
        {mockDonorProfile.badges.map((badge) => (
          <Card key={badge} style={styles.badgeRow}>
            <IconCircle name="ribbon-outline" background={colors.brand.primarySoft} color={colors.brand.primary} />
            <AppText variant="bodyM" style={styles.badgeLabel}>
              {badge}
            </AppText>
            <Ionicons name="checkmark-circle" size={18} color={colors.status.success} />
          </Card>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing['2xs'],
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radii['2xl'],
  },
  badgeLabel: {
    flex: 1,
  },
});
