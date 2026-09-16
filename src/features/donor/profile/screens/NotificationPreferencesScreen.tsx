import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Button } from '../../../../components/Button';
import { Card } from '../../../../components/Card';
import { IconCircle } from '../../../../components/IconCircle';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { profileService, type NotificationPrefs } from '../../../../services/profileService';
import { colors, spacing } from '../../../../theme';

const CHANNELS: { key: keyof NotificationPrefs; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'whatsapp', icon: 'logo-whatsapp' },
  { key: 'sms', icon: 'chatbubble-outline' },
  { key: 'email', icon: 'mail-outline' },
  { key: 'push', icon: 'notifications-outline' },
];

export function NotificationPreferencesScreen() {
  const { t } = useTranslation('donor');
  const [prefs, setPrefs] = useState<NotificationPrefs>({ whatsapp: true, sms: true, email: false, push: true });
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      await profileService.updateNotificationPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title={t('notificationPreferences.headerTitle')} subtitle={t('notificationPreferences.headerSubtitle')} />
      <Card style={styles.card}>
        {CHANNELS.map(({ key, icon }) => (
          <View key={key} style={styles.row}>
            <IconCircle name={icon} background={colors.surface.mutedSurface} color={colors.text.foreground} />
            <AppText variant="bodyM" style={styles.label}>
              {t(`notificationPreferences.${key}`)}
            </AppText>
            <Switch
              value={prefs[key]}
              onValueChange={(value) => setPrefs((prev) => ({ ...prev, [key]: value }))}
              trackColor={{ true: colors.brand.primary, false: colors.surface.border }}
            />
          </View>
        ))}
      </Card>
      <Button label={t('notificationPreferences.save')} loading={saving} onPress={onSave} style={styles.saveButton} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    flex: 1,
  },
  saveButton: {
    marginTop: 'auto',
  },
});
