import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { Pill, type PillTone } from '../../../../components/Pill';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { mockAdminRequests, mockHospitalNames } from '../../../../data/mockAdminData';
import { colors, spacing } from '../../../../theme';
import type { AdminRequestDetail } from '../../../../types/adminRequest';
import type { RequestStatus } from '../../../../types/donorRequest';

const STATUS_TONE: Record<RequestStatus, PillTone> = {
  pending_review: 'urgent',
  approved: 'info',
  rejected: 'critical',
  broadcast: 'success',
  fulfilled: 'success',
  expired: 'routine',
};

const STATUS_KEY: Record<RequestStatus, string> = {
  pending_review: 'statusPendingReview',
  approved: 'statusApproved',
  rejected: 'statusRejected',
  broadcast: 'statusBroadcast',
  fulfilled: 'statusFulfilled',
  expired: 'statusExpired',
};

type Filter = 'pending' | 'all';

export function AdminReviewQueueScreen() {
  const { t } = useTranslation('admin');
  const [filter, setFilter] = useState<Filter>('pending');

  const data = useMemo(
    () => (filter === 'pending' ? mockAdminRequests.filter((r) => r.status === 'pending_review') : mockAdminRequests),
    [filter],
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="screenTitle">{t('reviewQueue.headerTitle')}</AppText>
        <AppText variant="bodyS" color={colors.text.mutedForeground}>
          {t('reviewQueue.headerSubtitle')}
        </AppText>
      </View>

      <View style={styles.filterRow}>
        {(
          [
            ['pending', t('reviewQueue.statusPendingReview')],
            ['all', t('reviewQueue.headerTitle')],
          ] as [Filter, string][]
        ).map(([value, label]) => {
          const isActive = filter === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setFilter(value)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <AppText variant="bodyS" color={isActive ? colors.surface.surface : colors.text.mutedForeground}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <AppText variant="bodyM" color={colors.text.mutedForeground}>
            {t('reviewQueue.empty')}
          </AppText>
        }
        renderItem={({ item }) => <RequestRow item={item} />}
      />
    </ScreenContainer>
  );
}

function RequestRow({ item }: { item: AdminRequestDetail }) {
  const { t } = useTranslation('admin');
  return (
    <Pressable onPress={() => router.push(`/admin-request-detail/${item.id}`)}>
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.bloodTypeBadge}>
            <AppText variant="bodyS" color={colors.brand.primary} style={styles.bold}>
              {item.bloodType}
            </AppText>
          </View>
          <View style={styles.middle}>
            <AppText variant="bodyM" style={styles.bold}>
              {mockHospitalNames[item.hospitalId] ?? item.hospitalId}
            </AppText>
            <AppText variant="caption" color={colors.text.mutedForeground}>
              {item.city} · {t('reviewQueue.unitsNeeded', { count: item.unitsNeeded })}
            </AppText>
          </View>
          <Pill label={t(`reviewQueue.${STATUS_KEY[item.status]}`)} tone={STATUS_TONE[item.status]} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
    gap: spacing['2xs'],
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.surface,
  },
  filterChipActive: {
    backgroundColor: colors.text.foreground,
    borderColor: colors.text.foreground,
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
});
