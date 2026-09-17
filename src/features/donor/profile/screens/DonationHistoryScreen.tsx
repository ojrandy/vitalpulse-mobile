import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { IconCircle } from '../../../../components/IconCircle';
import { Pill } from '../../../../components/Pill';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { mockDonationHistory, mockDonorProfile } from '../../../../data/mockDonorData';
import { colors, spacing } from '../../../../theme';

export function DonationHistoryScreen() {
  const { t } = useTranslation('donor');
  const isVerified = mockDonorProfile.bloodTypeSource === 'lab_confirmed';

  return (
    <ScreenContainer>
      <ScreenHeader title={t('donationHistory.headerTitle')} subtitle={t('donationHistory.subtitle')} />
      <Card style={styles.statsCard}>
        <View style={styles.statsTopRow}>
          <AppText variant="bodyM" style={styles.bold}>
            {t('donationHistory.statsLine', {
              count: mockDonorProfile.totalDonations,
              lives: mockDonorProfile.livesImpacted,
            })}
          </AppText>
          {isVerified ? <Pill label={t('profile.verifiedDonor')} tone="success" /> : null}
        </View>
        <AppText variant="caption" color={colors.text.mutedForeground}>
          {t('donationHistory.memberSince', { date: new Date(mockDonorProfile.memberSince).toLocaleDateString() })}
        </AppText>
        <AppText variant="caption" color={colors.text.mutedForeground}>
          {t('donationHistory.nextEligible', { date: new Date(mockDonorProfile.nextEligibleDate).toLocaleDateString() })}
        </AppText>
      </Card>
      <FlatList
        data={mockDonationHistory}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <AppText variant="bodyM" color={colors.text.mutedForeground}>
            {t('donationHistory.empty')}
          </AppText>
        }
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <IconCircle name="water-outline" background={colors.brand.primarySoft} color={colors.brand.primary} />
            <View style={styles.textGroup}>
              <AppText variant="bodyM" style={styles.bold}>
                {item.hospitalName}
              </AppText>
              <AppText variant="caption" color={colors.text.mutedForeground}>
                {new Date(item.date).toLocaleDateString()} · {item.bloodType}
              </AppText>
            </View>
            <AppText variant="bodyS" color={colors.text.mutedForeground}>
              {t('donationHistory.units', { count: item.units })}
            </AppText>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    marginBottom: spacing.md,
    gap: spacing['2xs'],
  },
  statsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bold: {
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  textGroup: {
    flex: 1,
  },
});
