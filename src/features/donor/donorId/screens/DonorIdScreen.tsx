import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { mockDonorProfile } from '../../../../data/mockDonorData';
import { colors, elevation, radii, spacing } from '../../../../theme';

const DONOR_NUMBER = 'VP-CM-238941';
const VALID_THROUGH = '03 / 2027';
const CARD_INVERSE = 'rgba(254,251,248,0.7)';
const CARD_OVERLAY = 'rgba(254,251,248,0.15)';

export function DonorIdScreen() {
  const { t } = useTranslation('donor');

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="screenTitle">{t('donorId.headerTitle')}</AppText>
        <AppText variant="bodyS" color={colors.text.mutedForeground}>
          {t('donorId.headerSubtitle')}
        </AppText>
      </View>

      <View style={styles.idCard}>
        <View style={styles.idCardTopRow}>
          <View>
            <AppText variant="bodyM" color={colors.surface.surface} style={styles.bold}>
              VitalPulse
            </AppText>
            <AppText variant="caption" color={CARD_INVERSE} style={styles.country}>
              {t('donorId.country')}
            </AppText>
          </View>
          <View style={styles.activeBadge}>
            <AppText variant="caption" color={colors.surface.surface} style={styles.bold}>
              {t('donorId.active')}
            </AppText>
          </View>
        </View>

        <AppText variant="caption" color={CARD_INVERSE} style={styles.roleLabel}>
          {t('donorId.role').toUpperCase()}
        </AppText>
        <AppText variant="titleM" color={colors.surface.surface}>
          {mockDonorProfile.name}
        </AppText>
        <AppText variant="bodyS" color={CARD_INVERSE}>
          {mockDonorProfile.city}, {t('donorId.country')}
        </AppText>

        <View style={styles.bloodTypeChip}>
          <AppText variant="bodyM" color={colors.surface.surface} style={styles.bold}>
            {mockDonorProfile.bloodType}
          </AppText>
        </View>

        <View style={styles.idCardFooter}>
          <View>
            <AppText variant="caption" color={CARD_INVERSE}>
              {t('donorId.donorNumber')}
            </AppText>
            <AppText variant="bodyS" color={colors.surface.surface} style={styles.bold}>
              {DONOR_NUMBER}
            </AppText>
          </View>
          <View>
            <AppText variant="caption" color={CARD_INVERSE}>
              {t('donorId.validThrough')}
            </AppText>
            <AppText variant="bodyS" color={colors.surface.surface} style={styles.bold}>
              {VALID_THROUGH}
            </AppText>
          </View>
        </View>
      </View>

      <Card style={styles.qrCard}>
        <View style={styles.qrPlaceholder}>
          <Ionicons name="qr-code" size={96} color={colors.text.foreground} />
        </View>
        <AppText variant="bodyS" style={styles.bold}>
          {t('donorId.qrCaption')}
        </AppText>
        <AppText variant="caption" color={colors.text.mutedForeground}>
          {t('donorId.qrHint')}
        </AppText>
      </Card>

      <View style={styles.walletButton}>
        <Ionicons name="wallet-outline" size={18} color={colors.text.foreground} />
        <AppText variant="bodyM" style={styles.bold}>
          {t('donorId.saveToWallet')}
        </AppText>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  idCard: {
    backgroundColor: colors.brand.primary,
    borderRadius: radii['2xl'],
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...elevation.raised,
  },
  idCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bold: {
    fontWeight: '700',
  },
  country: {
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing['2xs'] / 2,
  },
  activeBadge: {
    backgroundColor: CARD_OVERLAY,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'] / 2,
  },
  roleLabel: {
    letterSpacing: 1,
    marginBottom: spacing['2xs'],
  },
  bloodTypeChip: {
    alignSelf: 'flex-start',
    backgroundColor: CARD_OVERLAY,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: CARD_OVERLAY,
  },
  qrCard: {
    alignItems: 'center',
    gap: spacing['2xs'],
    marginBottom: spacing.md,
  },
  qrPlaceholder: {
    width: 176,
    height: 176,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface.mutedSurface,
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii['2xl'],
    paddingVertical: spacing.md,
  },
});
