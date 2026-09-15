import { Text, type TextProps } from 'react-native';

import { colors, typeScale } from '../theme';

type Variant = keyof typeof typeScale;

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
}

export function AppText({
  variant = 'bodyM',
  color = colors.text.foreground,
  style,
  ...rest
}: AppTextProps) {
  return <Text style={[typeScale[variant], { color }, style]} {...rest} />;
}
