import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { Pill } from '../../../../components/Pill';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { mockHospitalProfile, mockInventory } from '../../../../data/mockHospitalData';
import { colors, radii, spacing } from '../../../../theme';
import type { InventoryRecord } from '../../../../types/inventory';

function clearedUnits(record: InventoryRecord) {
  return record.batches.filter((b) => b.testStatus === 'cleared').reduce((sum, b) => sum + b.units, 0);
}

function waitingTestCount(record: InventoryRecord) {
  return record.batches.filter((b) => b.testStatus === 'waiting_test').length;
}

export function HospitalInventoryScreen() {
  const { t } = useTranslation('hospital');

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="screenTitle">{t('inventory.headerTitle')}</AppText>
        <AppText variant="bodyS" color={colors.text.mutedForeground}>
          {mockHospitalProfile.name}
        </AppText>
      </View>
      <FlatList
        data={mockInventory}
        keyExtractor={(item) => item.bloodType}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <AppText variant="bodyM" color={colors.text.mutedForeground}>
            {t('inventory.empty')}
          </AppText>
        }
        renderItem={({ item }) => <InventoryRow record={item} />}
      />
    </ScreenContainer>
  );
}

function InventoryRow({ record }: { record: InventoryRecord }) {
  const { t } = useTranslation('hospital');
  const available = clearedUnits(record);
  const waiting = waitingTestCount(record);
  const isLow = available < record.threshold;

  return (
    <Pressable onPress={() => router.push(`/inventory-detail/${record.bloodType}`)}>
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.bloodTypeBadge}>
            <AppText variant="bodyM" color={colors.brand.primary} style={styles.bold}>
              {record.bloodType}
            </AppText>
          </View>
          <View style={styles.middle}>
            <AppText variant="bodyM" style={styles.bold}>
              {t('inventory.unitsAvailable', { count: available })}
            </AppText>
            <AppText variant="caption" color={colors.text.mutedForeground}>
              {t('inventory.batches', { count: record.batches.length })} ·{' '}
              {t('inventory.thresholdLabel', { count: record.threshold })}
            </AppText>
          </View>
          {isLow ? <Pill label={t('inventory.lowStock')} tone="critical" /> : null}
        </View>
        {waiting > 0 ? (
          <AppText variant="caption" color={colors.status.warning} style={styles.waitingNote}>
            {t('inventory.waitingTest', { count: waiting })}
          </AppText>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
    gap: spacing['2xs'],
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bloodTypeBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  waitingNote: {
    marginTop: spacing.xs,
  },
});
