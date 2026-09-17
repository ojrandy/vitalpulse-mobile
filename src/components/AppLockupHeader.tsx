import { StyleSheet, View } from 'react-native';

import { colors, fontFamily, spacing } from '../theme';
import { AppText } from './AppText';
import { VitalPulseMark } from './VitalPulseMark';

/** Icon + "VitalPulse" wordmark + country caption, used atop the auth screens (Figma Brand foundation). */
export function AppLockupHeader({ caption }: { caption: string }) {
  return (
    <View style={styles.row}>
      <VitalPulseMark size={34} />
      <View>
        <AppText variant="screenTitle" style={styles.wordmark}>
          Vital<AppText variant="screenTitle" color={colors.brand.primary} style={styles.wordmark}>
            Pulse
          </AppText>
        </AppText>
        <AppText variant="caption" color={colors.text.mutedForeground} style={styles.caption}>
          {caption}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  wordmark: {
    fontFamily: fontFamily.displayBold,
  },
  caption: {
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
});
