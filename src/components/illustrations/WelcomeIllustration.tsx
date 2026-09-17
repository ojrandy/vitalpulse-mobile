import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors } from '../../theme';

interface WelcomeIllustrationProps {
  size?: number;
}

/** Droplet-with-pulse-line hero art for the onboarding/welcome screen, built on the VitalPulseMark motif. */
export function WelcomeIllustration({ size = 220 }: WelcomeIllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <LinearGradient id="welcomeDrop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.brand.primary} />
          <Stop offset="1" stopColor={colors.brand.primaryDeep} />
        </LinearGradient>
      </Defs>
      <Circle cx="100" cy="100" r="96" fill={colors.brand.primarySoft} />
      <Circle cx="100" cy="100" r="72" fill={colors.surface.surface} />
      <Path
        d="M100 42 C132 88 152 113 152 134 C152 160 128 180 100 180 C72 180 48 160 48 134 C48 113 68 88 100 42 Z"
        fill="url(#welcomeDrop)"
      />
      <Path
        d="M60 130 L82 130 L92 110 L105 150 L116 122 L124 130 L140 130"
        stroke={colors.surface.surface}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
