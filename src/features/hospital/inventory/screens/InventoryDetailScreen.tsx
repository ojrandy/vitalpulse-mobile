import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { Card } from '../../../../components/Card';
import { Pill, type PillTone } from '../../../../components/Pill';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { StepperControl } from '../../../../components/StepperControl';
import { mockHospitalProfile, mockInventory } from '../../../../data/mockHospitalData';
import { inventoryService } from '../../../../services/inventoryService';
import { colors, spacing } from '../../../../theme';
import type { BatchTestStatus, InventoryBatch } from '../../../../types/inventory';

const STATUS_TONE: Record<BatchTestStatus, PillTone> = {
  waiting_test: 'urgent',
  cleared: 'success',
  rejected: 'critical',
};

export function InventoryDetailScreen() {
  const { t } = useTranslation('hospital');
  const { bloodType } = useLocalSearchParams<{ bloodType: string }>();
  const record = useMemo(() => mockInventory.find((r) => r.bloodType === bloodType), [bloodType]);

  const [batches, setBatches] = useState<InventoryBatch[]>(record?.batches ?? []);
  const [addUnits, setAddUnits] = useState(1);
  const [deductUnits, setDeductUnits] = useState(1);
  const [resolvingBatchId, setResolvingBatchId] = useState<string | null>(null);
  const [saving, setSaving] = useState<'add' | 'deduct' | null>(null);

  if (!record) {
    return (
      <ScreenContainer>
        <ScreenHeader title={t('inventoryDetail.headerTitle', { bloodType })} />
      </ScreenContainer>
    );
  }

  async function resolveBatch(batch: InventoryBatch, result: 'cleared' | 'rejected') {
    setResolvingBatchId(batch.id);
    try {
      await inventoryService.resolveLabTest({
        hospitalId: mockHospitalProfile.hospitalId,
        bloodType: record!.bloodType,
        batchId: batch.id,
        result,
      });
      setBatches((prev) => prev.map((b) => (b.id === batch.id ? { ...b, testStatus: result } : b)));
    } finally {
      setResolvingBatchId(null);
    }
  }

  async function handleAdd() {
    setSaving('add');
    try {
      await inventoryService.addInventoryStock({
        hospitalId: mockHospitalProfile.hospitalId,
        bloodType: record!.bloodType,
        units: addUnits,
      });
      setBatches((prev) => [
        ...prev,
        { id: `batch-${record!.bloodType}-${Date.now()}`, units: addUnits, testStatus: 'waiting_test', collectedAt: new Date().toISOString().slice(0, 10) },
      ]);
    } finally {
      setSaving(null);
    }
  }

  async function handleDeduct() {
    setSaving('deduct');
    try {
      await inventoryService.deductInventoryStock({
        hospitalId: mockHospitalProfile.hospitalId,
        bloodType: record!.bloodType,
        units: deductUnits,
      });
    } finally {
      setSaving(null);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader title={t('inventoryDetail.headerTitle', { bloodType: record.bloodType })} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AppText variant="sectionLabel" color={colors.text.mutedForeground} style={styles.sectionLabel}>
          {t('inventoryDetail.batchesTitle')}
        </AppText>
        {batches.map((batch) => (
          <Card key={batch.id} style={styles.batchCard}>
            <View style={styles.batchTopRow}>
              <View style={styles.batchInfo}>
                <AppText variant="bodyM" style={styles.bold}>
                  {t('inventoryDetail.unitsInBatch', { count: batch.units })}
                </AppText>
                <AppText variant="caption" color={colors.text.mutedForeground}>
                  {t('inventoryDetail.collected', { date: batch.collectedAt })}
                </AppText>
              </View>
              <Pill label={t(`inventoryDetail.status${statusKey(batch.testStatus)}`)} tone={STATUS_TONE[batch.testStatus]} />
            </View>
            {batch.testStatus === 'waiting_test' ? (
              <View style={styles.batchActions}>
                <Button
                  label={t('inventoryDetail.markCleared')}
                  variant="secondary"
                  loading={resolvingBatchId === batch.id}
                  onPress={() => resolveBatch(batch, 'cleared')}
                  style={styles.batchActionButton}
                />
                <Button
                  label={t('inventoryDetail.markRejected')}
                  variant="secondary"
                  loading={resolvingBatchId === batch.id}
                  onPress={() => resolveBatch(batch, 'rejected')}
                  style={styles.batchActionButton}
                />
              </View>
            ) : null}
          </Card>
        ))}

        <Card style={styles.adjustCard}>
          <AppText variant="sectionLabel" color={colors.text.mutedForeground} style={styles.sectionLabel}>
            {t('inventoryDetail.addStock')}
          </AppText>
          <StepperControl value={addUnits} onChange={setAddUnits} unitLabel={t('inventoryDetail.unitsToAdd')} max={50} />
          <Button label={t('inventoryDetail.confirmAdd')} loading={saving === 'add'} onPress={handleAdd} style={styles.confirmButton} />
        </Card>

        <Card style={styles.adjustCard}>
          <AppText variant="sectionLabel" color={colors.text.mutedForeground} style={styles.sectionLabel}>
            {t('inventoryDetail.deductStock')}
          </AppText>
          <StepperControl value={deductUnits} onChange={setDeductUnits} unitLabel={t('inventoryDetail.unitsToDeduct')} max={50} />
          <Button
            label={t('inventoryDetail.confirmDeduct')}
            variant="secondary"
            loading={saving === 'deduct'}
            onPress={handleDeduct}
            style={styles.confirmButton}
          />
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function statusKey(status: BatchTestStatus) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  batchCard: {
    marginBottom: spacing.sm,
  },
  batchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  batchInfo: {
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  batchActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  batchActionButton: {
    flex: 1,
  },
  adjustCard: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  confirmButton: {
    marginTop: spacing.xs,
  },
});
