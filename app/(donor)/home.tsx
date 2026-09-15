import { View } from 'react-native';

import { AppText } from '../../src/components/AppText';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors } from '../../src/theme';

/**
 * Placeholder — the real donor Home screen lands in the next screen-group PR
 * (see the plan for the auth/onboarding PR). This just gives the onboarding
 * flow somewhere to land so it's navigable end-to-end.
 */
export default function DonorHomePlaceholder() {
  return (
    <ScreenContainer>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="titleM">Donor Home</AppText>
        <AppText variant="bodyM" color={colors.text.mutedForeground}>
          Coming in the next PR.
        </AppText>
      </View>
    </ScreenContainer>
  );
}
