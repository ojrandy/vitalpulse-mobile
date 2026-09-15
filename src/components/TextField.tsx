import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radii, spacing } from '../theme';
import { AppText } from './AppText';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <AppText variant="bodyS" color={colors.text.mutedForeground} style={styles.label}>
        {label}
      </AppText>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.text.mutedForeground}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color={colors.status.warning} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing['2xs'],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text.foreground,
    backgroundColor: colors.surface.surface,
  },
  inputError: {
    borderColor: colors.status.warning,
  },
  error: {
    marginTop: spacing['2xs'],
  },
});
