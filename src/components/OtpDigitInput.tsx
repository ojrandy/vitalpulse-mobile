import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radii } from '../theme';

interface OtpDigitInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  hasError?: boolean;
}

/** Six separate boxed digits with auto-advance focus, matching the Figma OTP screen. */
export function OtpDigitInput({ value, onChange, length = 6, hasError = false }: OtpDigitInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const setDigit = (index: number, text: string) => {
    const digit = text.replace(/[^\d]/g, '').slice(-1);
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(''));
    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          style={[styles.box, (focusedIndex === index || hasError) && (hasError ? styles.boxError : styles.boxActive)]}
          value={digit}
          onChangeText={(text) => setDigit(index, text)}
          onKeyPress={({ nativeEvent }) => onKeyPress(index, nativeEvent.key)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex((prev) => (prev === index ? null : prev))}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.surface.border,
    borderRadius: radii.xl,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.foreground,
    backgroundColor: colors.surface.surface,
  },
  boxActive: {
    borderColor: colors.brand.primary,
  },
  boxError: {
    borderColor: colors.status.warning,
  },
});
