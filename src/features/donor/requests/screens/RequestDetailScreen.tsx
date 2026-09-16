import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { Card } from '../../../../components/Card';
import { Pill, type PillTone } from '../../../../components/Pill';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { mockBroadcasts, mockMyRequests } from '../../../../data/mockDonorData';
import { colors, spacing } from '../../../../theme';

const URGENCY_TONE: Record<string, PillTone> = { critical: 'critical', urgent: 'urgent', routine: 'routine' };

export function RequestDetailScreen() {
  const { t } = useTranslation('donor');
  const { id } = useLocalSearchParams<{ id: string }>();

  const broadcast = mockBroadcasts.find((b) => b.requestId === id || b.id === id);
  const ownRequest = mockMyRequests.find((r) => r.id === id);

  return (
    <ScreenContainer>
      <ScreenHeader title={t('requestDetail.headerTitle')} />
      {broadcast ? (
        <Card>
          <View style={styles.topRow}>
            <View style={styles.bloodTypeBadge}>
              <AppText variant="bodyM" color={colors.brand.primary} style={styles.bold}>
                {broadcast.bloodType}
              </AppText>
            </View>
            <Pill label={broadcast.urgency} tone={URGENCY_TONE[broadcast.urgency]} />
          </View>
          <AppText variant="titleM" style={styles.spacingTop}>
            {broadcast.hospitalName}
          </AppText>
          <AppText variant="bodyM" color={colors.text.mutedForeground}>
            {broadcast.city}
          </AppText>
          <AppText variant="bodyM" style={[styles.bold, styles.spacingTop]}>
            {t('requestDetail.unitsNeeded', { count: broadcast.unitsNeeded })}
          </AppText>
          <Button label={t('requestDetail.iCanHelp')} style={styles.spacingTop} />
        </Card>
      ) : null}

      {ownRequest ? (
        <Card>
          <View style={styles.topRow}>
            <View style={styles.bloodTypeBadge}>
              <AppText variant="bodyM" color={colors.brand.primary} style={styles.bold}>
                {ownRequest.bloodType}
              </AppText>
            </View>
            <Pill
              label={t(`myRequests.status${capitalize(ownRequest.status)}`)}
              tone={ownRequest.status === 'rejected' ? 'critical' : 'info'}
            />
          </View>
          <AppText variant="titleM" style={styles.spacingTop}>
            {ownRequest.hospitalName ?? ownRequest.city}
          </AppText>
          <AppText variant="bodyM" color={colors.text.mutedForeground}>
            {t('requestDetail.submitted', { date: new Date(ownRequest.createdAt).toLocaleDateString() })}
          </AppText>
          <AppText variant="bodyM" style={[styles.bold, styles.spacingTop]}>
            {t('requestDetail.unitsNeeded', { count: ownRequest.unitsNeeded })}
          </AppText>
          {ownRequest.rejectionReason ? (
            <View style={styles.rejectionBox}>
              <AppText variant="bodyS" color={colors.status.warning} style={styles.bold}>
                {t('requestDetail.rejectionReason')}
              </AppText>
              <AppText variant="bodyS" color={colors.text.mutedForeground}>
                {ownRequest.rejectionReason}
              </AppText>
            </View>
          ) : null}
        </Card>
      ) : null}

      {!broadcast && !ownRequest ? (
        <AppText variant="bodyM" color={colors.text.mutedForeground}>
          {id}
        </AppText>
      ) : null}
    </ScreenContainer>
  );
}

function capitalize(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bloodTypeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bold: {
    fontWeight: '700',
  },
  spacingTop: {
    marginTop: spacing.sm,
  },
  rejectionBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: 14,
    backgroundColor: colors.status.warningSoft,
    gap: spacing['2xs'],
  },
});
