import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { useAuthStore } from '../../../../stores/authStore';
import { colors, radii, spacing } from '../../../../theme';

export function AdminProfileScreen() {
  const { t } = useTranslation('admin');
  const signOut = useAuthStore((state) => state.signOut);
  const uid = useAuthStore((state) => state.uid);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="screenTitle">{t('profile.headerTitle')}</AppText>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <AppText variant="titleM" color={colors.brand.primaryDeep}>
            SA
          </AppText>
        </View>
        <View style={styles.profileText}>
          <AppText variant="screenTitle">{t('profile.role')}</AppText>
          <AppText variant="bodyS" color={colors.text.mutedForeground}>
            {uid ?? 'admin-uid-randy'}
          </AppText>
        </View>
      </Card>

      <Pressable onPress={signOut}>
        <Card style={styles.signOutRow}>
          <AppText variant="bodyM" color={colors.status.warning} style={styles.bold}>
            {t('profile.signOut')}
          </AppText>
        </Card>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
  signOutRow: {
    alignItems: 'center',
  },
  bold: {
    fontWeight: '700',
  },
});
