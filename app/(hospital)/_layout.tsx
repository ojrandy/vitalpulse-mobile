import { Stack } from 'expo-router';

/**
 * Everything under (hospital) — the tab bar plus every hospital-only detail
 * screen (inventory-detail, etc.) — lives in this one Stack. The role guard
 * lives one level up in the root layout, which mounts this entire subtree
 * only for `role === 'hospital_staff' | 'hospital_admin'`; nesting every
 * hospital screen here (instead of loose at the app root) is what makes that
 * guard cover them.
 */
export default function HospitalLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
