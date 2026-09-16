import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

interface IconCircleProps {
  name: keyof typeof Ionicons.glyphMap;
  background: string;
  color: string;
  size?: number;
  iconSize?: number;
}

export function IconCircle({ name, background, color, size = 36, iconSize = 18 }: IconCircleProps) {
  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }]}>
      <Ionicons name={name} size={iconSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
