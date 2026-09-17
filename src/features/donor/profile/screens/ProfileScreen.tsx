import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { IconCircle } from '../../../../components/IconCircle';
import { Pill } from '../../../../components/Pill';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { mockDonorProfile } from '../../../../data/mockDonorData';
import { useAuthStore } from '../../../../stores/authStore';
import { colors, radii, spacing } from '../../../../theme';

const NAV_ITEMS: { key: string; icon: keyof typeof Ionicons.glyphMap; href: string }[] = [
  { key: 'donationHistory', icon: 'time-outline', href: '/donation-history' },
  { key: 'badgesAndTier', icon: 'ribbon-outline', href: '/badges' },
  { key: 'notificationPreferences', icon: 'notifications-outline', href: '/notification-preferences' },
  { key: 'bloodCompatibility', icon: 'water-outline', href: '/blood-compatibility' },
];

export function ProfileScreen() {
  const { t } = useTranslation('donor');
  const signOut = useAuthStore((state) => state.signOut);
  const isVerified = mockDonorProfile.bloodTypeSource === 'lab_confirmed';

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="screenTitle">{t('profile.headerTitle')}</AppText>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatar}>
              <AppText variant="titleM" color={colors.brand.primaryDeep}>
                {mockDonorProfile.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </AppText>
            </View>
            <View style={styles.profileText}>
              <AppText variant="screenTitle">{mockDonorProfile.name}</AppText>
              <AppText variant="bodyS" color={colors.text.mutedForeground}>
                {mockDonorProfile.bloodType} · {mockDonorProfile.city} · {mockDonorProfile.tier} donor
              </AppText>
            </View>
            {isVerified ? <Pill label={t('profile.verifiedDonor')} tone="success" /> : null}
          </View>
          <View style={styles.statRow}>
            <AppText variant="numeric" color={colors.brand.primary}>
              {mockDonorProfile.totalDonations}
            </AppText>
            <AppText variant="caption" color={colors.text.mutedForeground}>
              {t('profile.donationsStatLabel')}
            </AppText>
          </View>
        </Card>

        {NAV_ITEMS.map((item) => (
          <Pressable key={item.key} onPress={() => router.push(item.href)}>
            <Card style={styles.navRow}>
              <IconCircle name={item.icon} background={colors.surface.mutedSurface} color={colors.text.foreground} />
              <AppText variant="bodyM" style={styles.navLabel}>
                {t(`profile.${item.key}`)}
              </AppText>
              <Ionicons name="chevron-forward" size={18} color={colors.text.mutedForeground} />
            </Card>
          </Pressable>
        ))}

        <Pressable onPress={signOut}>
          <Card style={styles.signOutRow}>
            <AppText variant="bodyM" color={colors.status.warning} style={styles.bold}>
              {t('profile.signOut')}
            </AppText>
          </Card>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  profileCard: {
    gap: spacing.sm,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing['2xs'],
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
    paddingTop: spacing.sm,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navLabel: {
    flex: 1,
  },
  signOutRow: {
    alignItems: 'center',
  },
  bold: {
    fontWeight: '700',
  },
});
