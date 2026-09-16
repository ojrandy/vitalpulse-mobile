import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { IconCircle } from '../../../../components/IconCircle';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { mockDonationHistory } from '../../../../data/mockDonorData';
import { colors, spacing } from '../../../../theme';

export function DonationHistoryScreen() {
  const { t } = useTranslation('donor');

  return (
    <ScreenContainer>
      <ScreenHeader title={t('donationHistory.headerTitle')} subtitle={t('donationHistory.subtitle')} />
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
  bold: {
    fontWeight: '700',
  },
});
