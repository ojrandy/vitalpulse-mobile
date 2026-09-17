import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

const logoSource = require('../../assets/vitalpulse-logo.png');

interface VitalPulseMarkProps {
  size?: number;
}

/** The droplet-with-pulse-line app mark from the Figma Brand foundation. */
export function VitalPulseMark({ size = 48 }: VitalPulseMarkProps) {
  return <Image source={logoSource} style={[styles.base, { width: size, height: size }]} contentFit="contain" />;
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'center',
  },
});
