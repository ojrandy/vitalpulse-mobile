import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '../theme';
import { AppText } from './AppText';

interface StepperControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unitLabel: string;
}

export function StepperControl({ value, onChange, min = 1, max = 20, unitLabel }: StepperControlProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={[styles.button, styles.decrease, value <= min && styles.buttonDisabled]}
      >
        <Ionicons name="remove" size={16} color={colors.brand.primary} />
      </Pressable>
      <AppText variant="titleM" style={styles.value}>
        {value} {unitLabel}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase"
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={[styles.button, styles.increase, value >= max && styles.buttonDisabled]}
      >
        <Ionicons name="add" size={16} color={colors.text.mutedForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.xl,
    padding: spacing['2xs'],
    justifyContent: 'space-between',
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decrease: {
    backgroundColor: colors.surface.surfaceSunken,
  },
  increase: {
    backgroundColor: colors.brand.primarySoft,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  value: {
    flex: 1,
    textAlign: 'center',
  },
});
