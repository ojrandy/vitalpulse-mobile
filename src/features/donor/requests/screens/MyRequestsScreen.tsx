import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { Pill, type PillTone } from '../../../../components/Pill';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { mockMyRequests } from '../../../../data/mockDonorData';
import type { DonorRequestSummary, RequestStatus } from '../../../../types/donorRequest';
import { colors, spacing } from '../../../../theme';

const STATUS_TONE: Record<RequestStatus, PillTone> = {
  pending_review: 'neutral',
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

export function MyRequestsScreen() {
  const { t } = useTranslation('donor');

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="screenTitle">{t('myRequests.headerTitle')}</AppText>
      </View>
      <FlatList
        data={mockMyRequests}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <AppText variant="bodyM" color={colors.text.mutedForeground}>
            {t('myRequests.empty')}
          </AppText>
        }
        renderItem={({ item }) => <RequestRow item={item} />}
      />
    </ScreenContainer>
  );
}

function RequestRow({ item }: { item: DonorRequestSummary }) {
  const { t } = useTranslation('donor');
  return (
    <Pressable onPress={() => router.push(`/request-detail/${item.id}`)}>
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.bloodTypeBadge}>
            <AppText variant="bodyS" color={colors.brand.primary} style={styles.bold}>
              {item.bloodType}
            </AppText>
          </View>
          <View style={styles.middle}>
            <AppText variant="bodyM" style={styles.bold}>
              {item.hospitalName ?? item.city}
            </AppText>
            <AppText variant="caption" color={colors.text.mutedForeground}>
              {new Date(item.createdAt).toLocaleDateString()}
            </AppText>
          </View>
          <Pill label={t(`myRequests.${STATUS_KEY[item.status]}`)} tone={STATUS_TONE[item.status]} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
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
