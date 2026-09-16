import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { IconCircle } from '../../../../components/IconCircle';
import { Pill, type PillTone } from '../../../../components/Pill';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { mockBroadcasts, mockDonorProfile } from '../../../../data/mockDonorData';
import type { Broadcast } from '../../../../schemas/broadcastSchema';
import { colors, radii, spacing } from '../../../../theme';

type Filter = 'all' | 'critical' | 'nearMe';

const URGENCY_TONE: Record<Broadcast['urgency'], PillTone> = {
  critical: 'critical',
  urgent: 'urgent',
  routine: 'routine',
};

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function timeAgo(iso: string, t: (key: string, opts?: Record<string, unknown>) => string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return t('home.minutesAgo', { count: minutes });
  return t('home.hoursAgo', { count: Math.round(minutes / 60) });
}

export function DonorHomeScreen() {
  const { t } = useTranslation('donor');
  const [filter, setFilter] = useState<Filter>('all');

  const filteredBroadcasts = useMemo(() => {
    if (filter === 'critical') return mockBroadcasts.filter((b) => b.urgency === 'critical');
    if (filter === 'nearMe') return [...mockBroadcasts].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    return mockBroadcasts;
  }, [filter]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <AppText variant="bodyS" color={colors.brand.primaryDeep} style={styles.avatarLabel}>
            {initials(mockDonorProfile.name)}
          </AppText>
        </View>
        <View style={styles.headerText}>
          <AppText variant="caption" color={colors.text.mutedForeground}>
            {t('home.greeting')}
          </AppText>
          <AppText variant="screenTitle">{mockDonorProfile.name}</AppText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={18} color={colors.text.foreground} />
          <View style={styles.bellDot} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Card
          tinted={{ background: colors.status.successSoft, borderColor: 'rgba(20,118,74,0.25)' }}
          style={styles.eligibilityCard}
        >
          <IconCircle name="calendar-outline" background={colors.status.success} color={colors.surface.surface} size={48} />
          <View style={styles.eligibilityText}>
            <View style={styles.eligibilityTitleRow}>
              <AppText variant="bodyM" style={styles.bold}>
                {mockDonorProfile.isEligible ? t('home.eligible') : t('home.notEligible')}
              </AppText>
              <Pill label={mockDonorProfile.bloodType} tone="success" />
            </View>
            <AppText variant="caption" color={colors.text.mutedForeground}>
              {t('home.lastDonation', { date: mockDonorProfile.lastDonationDate, city: mockDonorProfile.city })}
            </AppText>
          </View>
        </Card>

        <View style={styles.quickActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/request-blood')}
            style={[styles.quickAction, styles.quickActionSpacing]}
          >
            <IconCircle name="add-circle-outline" background={colors.brand.primarySoft} color={colors.brand.primary} />
            <AppText variant="bodyS" style={styles.bold}>
              {t('home.requestBlood')}
            </AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/report-shortage')} style={styles.quickAction}>
            <IconCircle name="megaphone-outline" background={colors.status.warningSoft} color={colors.status.warning} />
            <AppText variant="bodyS" style={styles.bold}>
              {t('home.reportShortage')}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="sectionLabel" color={colors.text.mutedForeground}>
            {t('home.matchedForYou')}
          </AppText>
          <Pressable accessibilityRole="button">
            <AppText variant="bodyS" color={colors.brand.primary}>
              {t('home.seeAll')}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {(
            [
              ['all', t('home.filterAll', { count: mockBroadcasts.length })],
              ['critical', t('home.filterCritical')],
              ['nearMe', t('home.filterNearMe')],
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

        {filteredBroadcasts.map((broadcast) => (
          <Pressable key={broadcast.id} onPress={() => router.push(`/request-detail/${broadcast.requestId}`)}>
            <Card style={styles.requestCard}>
              <View style={styles.requestTopRow}>
                <View style={styles.bloodTypeBadge}>
                  <AppText variant="bodyM" color={colors.brand.primary} style={styles.bold}>
                    {broadcast.bloodType}
                  </AppText>
                </View>
                <Pill label={t(`requestBlood.urgency${capitalize(broadcast.urgency)}` as const)} tone={URGENCY_TONE[broadcast.urgency]} />
                <View style={styles.spacer} />
                <AppText variant="caption" color={colors.text.mutedForeground}>
                  {timeAgo(broadcast.createdAt, t)}
                </AppText>
              </View>
              <AppText variant="bodyM" style={[styles.bold, styles.hospitalName]}>
                {broadcast.hospitalName}
              </AppText>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color={colors.text.mutedForeground} />
                <AppText variant="caption" color={colors.text.mutedForeground}>
                  {broadcast.city}
                  {broadcast.distanceKm != null ? ` · ${broadcast.distanceKm.toFixed(1)} km away` : ''}
                </AppText>
              </View>
              <View style={styles.requestFooter}>
                <AppText variant="bodyS" style={styles.bold}>
                  {t('home.unitsNeeded', { count: broadcast.unitsNeeded })}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/request-detail/${broadcast.requestId}`)}
                  style={styles.helpButton}
                >
                  <AppText variant="bodyS" color={colors.surface.surface} style={styles.bold}>
                    {t('home.iCanHelp')}
                  </AppText>
                </Pressable>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radii.full,
    backgroundColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surface.mutedSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.brand.primary,
    borderWidth: 2,
    borderColor: colors.surface.surface,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  eligibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eligibilityText: {
    flex: 1,
    gap: spacing['2xs'],
  },
  eligibilityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bold: {
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii['2xl'],
    padding: spacing.sm,
    backgroundColor: colors.surface.surface,
  },
  quickActionSpacing: {
    marginRight: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'],
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.surface,
  },
  filterChipActive: {
    backgroundColor: colors.text.foreground,
    borderColor: colors.text.foreground,
  },
  requestCard: {
    marginBottom: spacing.md,
  },
  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  bloodTypeBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  hospitalName: {
    marginBottom: spacing['2xs'],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
    marginBottom: spacing.sm,
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
    paddingTop: spacing.sm,
  },
  helpButton: {
    backgroundColor: colors.brand.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
