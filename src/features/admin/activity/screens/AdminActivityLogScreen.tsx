import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { IconCircle } from '../../../../components/IconCircle';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { mockActorNames, mockAuditLog, type AuditLogEntry } from '../../../../data/mockAdminData';
import { colors, spacing } from '../../../../theme';

const ACTION_ICON: Record<AuditLogEntry['action'], keyof typeof Ionicons.glyphMap> = {
  request_approved: 'checkmark-circle-outline',
  request_rejected: 'close-circle-outline',
  broadcast_sent: 'megaphone-outline',
  role_granted: 'shield-checkmark-outline',
};

const ACTION_TRANSLATION_KEY: Record<AuditLogEntry['action'], string> = {
  request_approved: 'actionRequestApproved',
  request_rejected: 'actionRequestRejected',
  broadcast_sent: 'actionBroadcastSent',
  role_granted: 'actionRoleGranted',
};

export function AdminActivityLogScreen() {
  const { t } = useTranslation('admin');

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="screenTitle">{t('activityLog.headerTitle')}</AppText>
        <AppText variant="bodyS" color={colors.text.mutedForeground}>
          {t('activityLog.headerSubtitle')}
        </AppText>
      </View>
      <FlatList
        data={mockAuditLog}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <AppText variant="bodyM" color={colors.text.mutedForeground}>
            {t('activityLog.empty')}
          </AppText>
        }
        renderItem={({ item }) => <ActivityRow item={item} />}
      />
    </ScreenContainer>
  );
}

function ActivityRow({ item }: { item: AuditLogEntry }) {
  const { t } = useTranslation('admin');
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <IconCircle name={ACTION_ICON[item.action]} background={colors.surface.mutedSurface} color={colors.text.foreground} />
        <View style={styles.middle}>
          <AppText variant="bodyM" style={styles.bold}>
            {t(`activityLog.${ACTION_TRANSLATION_KEY[item.action]}`, { targetId: item.targetId })}
          </AppText>
          <AppText variant="caption" color={colors.text.mutedForeground}>
            {mockActorNames[item.actorUid] ?? item.actorUid} · {new Date(item.timestamp).toLocaleString()}
          </AppText>
        </View>
      </View>
    </Card>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  middle: {
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
});
