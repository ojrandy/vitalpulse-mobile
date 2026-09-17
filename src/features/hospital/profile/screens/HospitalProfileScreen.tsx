import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { Card } from '../../../../components/Card';
import { ScreenContainer } from '../../../../components/ScreenContainer';
import { mockHospitalProfile } from '../../../../data/mockHospitalData';
import { useAuthStore } from '../../../../stores/authStore';
import { colors, radii, spacing } from '../../../../theme';

export function HospitalProfileScreen() {
  const { t } = useTranslation('hospital');
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="screenTitle">{t('profile.headerTitle')}</AppText>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <AppText variant="titleM" color={colors.brand.primaryDeep}>
            {mockHospitalProfile.name
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')}
          </AppText>
        </View>
        <View style={styles.profileText}>
          <AppText variant="screenTitle">{mockHospitalProfile.name}</AppText>
          <AppText variant="bodyS" color={colors.text.mutedForeground}>
            {t('profile.role')} · {mockHospitalProfile.city}
          </AppText>
          <AppText variant="caption" color={colors.text.mutedForeground} style={styles.idText}>
            {t('profile.hospitalId')}: {mockHospitalProfile.hospitalId}
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
  idText: {
    marginTop: spacing['2xs'],
  },
  signOutRow: {
    alignItems: 'center',
  },
  bold: {
    fontWeight: '700',
  },
});
