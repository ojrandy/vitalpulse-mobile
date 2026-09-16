import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '../theme';
import { AppText } from './AppText';

export type PillTone = 'critical' | 'urgent' | 'routine' | 'success' | 'info' | 'neutral';

const TONE_STYLES: Record<PillTone, { background: string; text: string; border?: string }> = {
  critical: { background: colors.brand.primary, text: colors.surface.surface },
  urgent: { background: colors.status.warningSoft, text: colors.status.warning },
  routine: { background: colors.surface.surface, text: colors.text.mutedForeground, border: colors.surface.border },
  success: { background: colors.status.successSoft, text: colors.status.success },
  info: { background: colors.status.infoSoft, text: colors.status.info },
  neutral: { background: colors.surface.mutedSurface, text: colors.text.foreground },
};

interface PillProps {
  label: string;
  tone?: PillTone;
}

export function Pill({ label, tone = 'neutral' }: PillProps) {
  const toneStyle = TONE_STYLES[tone];
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: toneStyle.background, borderColor: toneStyle.border ?? toneStyle.background },
      ]}
    >
      <AppText variant="caption" color={toneStyle.text} style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing['2xs'] / 2,
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
