import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { BottomActionBar } from '../../../../components/BottomActionBar';
import { Button } from '../../../../components/Button';
import { Card } from '../../../../components/Card';
import { Pill, type PillTone } from '../../../../components/Pill';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { TextField } from '../../../../components/TextField';
import { mockAdminRequests, mockHospitalNames } from '../../../../data/mockAdminData';
import { reviewRequestSchema } from '../../../../schemas/reviewSchema';
import { reviewService } from '../../../../services/reviewService';
import { colors, spacing } from '../../../../theme';
import type { RequestStatus } from '../../../../types/donorRequest';

const STATUS_TONE: Record<RequestStatus, PillTone> = {
  pending_review: 'urgent',
  approved: 'info',
  rejected: 'critical',
  broadcast: 'success',
  fulfilled: 'success',
  expired: 'routine',
};

export function AdminRequestDetailScreen() {
  const { t } = useTranslation('admin');
  const { id } = useLocalSearchParams<{ id: string }>();
  const request = useMemo(() => mockAdminRequests.find((r) => r.id === id), [id]);

  const [status, setStatus] = useState<RequestStatus | undefined>(request?.status);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState<string | undefined>();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState<'approve' | 'reject' | null>(null);

  if (!request) {
    return (
      <ScreenContainer>
        <ScreenHeader title={t('requestDetail.headerTitle')} />
      </ScreenContainer>
    );
  }

  async function handleApprove() {
    setSubmitting('approve');
    try {
      const result = await reviewService.reviewRequest(reviewRequestSchema.parse({ requestId: request!.id, decision: 'approve' }));
      setStatus(result.status);
    } finally {
      setSubmitting(null);
    }
  }

  async function handleReject() {
    const parsed = reviewRequestSchema.safeParse({ requestId: request!.id, decision: 'reject', rejectionReason });
    if (!parsed.success) {
      setRejectionError(t('requestDetail.rejectionReasonRequired'));
      return;
    }
    setRejectionError(undefined);
    setSubmitting('reject');
    try {
      const result = await reviewService.reviewRequest(parsed.data);
      setStatus(result.status);
    } finally {
      setSubmitting(null);
    }
  }

  const isPending = status === 'pending_review';

  return (
    <ScreenContainer>
      <ScreenHeader title={t('requestDetail.headerTitle')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Card>
          <View style={styles.topRow}>
            <View style={styles.bloodTypeBadge}>
              <AppText variant="bodyM" color={colors.brand.primary} style={styles.bold}>
                {request.bloodType}
              </AppText>
            </View>
            {status ? <Pill label={t(`reviewQueue.status${statusKey(status)}`)} tone={STATUS_TONE[status]} /> : null}
          </View>
          <AppText variant="titleM" style={styles.spacingTop}>
            {mockHospitalNames[request.hospitalId] ?? request.hospitalId}
          </AppText>
          <AppText variant="bodyM" color={colors.text.mutedForeground}>
            {request.city}
          </AppText>
          <AppText variant="bodyM" style={[styles.bold, styles.spacingTop]}>
            {t('reviewQueue.unitsNeeded', { count: request.unitsNeeded })}
          </AppText>
          <AppText variant="bodyS" color={colors.text.mutedForeground} style={styles.spacingTop}>
            {t('requestDetail.submittedBy', { uid: request.submittedBy })}
          </AppText>
          {request.reviewedBy && request.reviewedAt ? (
            <AppText variant="bodyS" color={colors.text.mutedForeground}>
              {t('requestDetail.reviewedBy', { uid: request.reviewedBy, date: new Date(request.reviewedAt).toLocaleDateString() })}
            </AppText>
          ) : null}
        </Card>

        {request.patientContext ? (
          <Card style={styles.contextCard}>
            <AppText variant="sectionLabel" color={colors.text.mutedForeground} style={styles.sectionLabel}>
              {t('requestDetail.patientContext')}
            </AppText>
            <AppText variant="bodyM">{request.patientContext.notes}</AppText>
          </Card>
        ) : null}

        {request.rejectionReason ? (
          <View style={styles.rejectionBox}>
            <AppText variant="bodyS" color={colors.status.warning} style={styles.bold}>
              {t('requestDetail.rejectionReasonLabel')}
            </AppText>
            <AppText variant="bodyS" color={colors.text.mutedForeground}>
              {request.rejectionReason}
            </AppText>
          </View>
        ) : null}

        {isPending && showRejectForm ? (
          <Card style={styles.contextCard}>
            <TextField
              label={t('requestDetail.rejectionReasonLabel')}
              placeholder={t('requestDetail.rejectionReasonPlaceholder')}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              error={rejectionError}
              multiline
            />
          </Card>
        ) : null}
      </ScrollView>

      {isPending ? (
        <BottomActionBar>
          <Button
            label={t('requestDetail.reject')}
            variant="secondary"
            loading={submitting === 'reject'}
            onPress={() => (showRejectForm ? handleReject() : setShowRejectForm(true))}
            style={styles.actionButton}
          />
          <Button
            label={t('requestDetail.approve')}
            loading={submitting === 'approve'}
            onPress={handleApprove}
            style={styles.actionButton}
          />
        </BottomActionBar>
      ) : null}
    </ScreenContainer>
  );
}

function statusKey(status: RequestStatus) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
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
  contextCard: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  rejectionBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: 14,
    backgroundColor: colors.status.warningSoft,
    gap: spacing['2xs'],
  },
  actionButton: {
    flex: 1,
  },
});
