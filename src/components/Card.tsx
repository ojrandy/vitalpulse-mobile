import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, elevation, radii, spacing } from '../theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  tinted?: { background: string; borderColor: string };
}

export function Card({ children, style, tinted }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        tinted ? { backgroundColor: tinted.background, borderColor: tinted.borderColor } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface.surface,
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii['2xl'],
    padding: spacing.md,
    ...elevation.card,
  },
});
