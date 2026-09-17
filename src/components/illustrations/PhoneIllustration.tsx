import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors } from '../../theme';

interface PhoneIllustrationProps {
  size?: number;
}

/** Phone-with-verification hero art for the phone-entry screen: a handset with an incoming code and a location pin. */
export function PhoneIllustration({ size = 180 }: PhoneIllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <LinearGradient id="phoneFrame" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.brand.primary} />
          <Stop offset="1" stopColor={colors.brand.primaryDeep} />
        </LinearGradient>
      </Defs>
      <Circle cx="100" cy="100" r="96" fill={colors.brand.primarySoft} />

      <Rect x="66" y="34" width="68" height="132" rx="16" fill="url(#phoneFrame)" />
      <Rect x="74" y="48" width="52" height="94" rx="6" fill={colors.surface.surface} />
      <Circle cx="100" cy="152" r="4.5" fill={colors.surface.surface} />

      <Rect x="82" y="60" width="36" height="8" rx="4" fill={colors.brand.primarySoft} />
      <Rect x="82" y="74" width="26" height="6" rx="3" fill={colors.surface.border} />
      <Rect x="82" y="86" width="30" height="6" rx="3" fill={colors.surface.border} />

      <Circle cx="146" cy="56" r="22" fill={colors.surface.surface} />
      <Path
        d="M146 44 C152 44 157 49 157 55 C157 63 146 72 146 72 C146 72 135 63 135 55 C135 49 140 44 146 44 Z"
        fill={colors.status.info}
      />
      <Circle cx="146" cy="55" r="4" fill={colors.surface.surface} />

      <Circle cx="52" cy="140" r="18" fill={colors.surface.surface} />
      <Path
        d="M44 140 L50 146 L61 132"
        stroke={colors.status.success}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
