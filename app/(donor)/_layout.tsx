import { Stack } from 'expo-router';

/**
 * Everything under (donor) — the tab bar plus every donor-only detail/utility
 * screen (badges, donation-history, request-blood, etc.) — lives in this one
 * Stack. The role guard lives one level up in the root layout, which mounts
 * this entire subtree only for `role === 'donor'`; nesting every donor screen
 * here (instead of loose at the app root) is what makes that guard cover them.
 */
export default function DonorLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
