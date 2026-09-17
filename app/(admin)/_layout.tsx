import { Stack } from 'expo-router';

/**
 * Everything under (admin) — the tab bar plus every admin-only detail screen
 * (admin-request-detail, etc.) — lives in this one Stack. The role guard
 * lives one level up in the root layout, which mounts this entire subtree
 * only for `role === 'system_admin'`; nesting every admin screen here
 * (instead of loose at the app root) is what makes that guard cover them.
 */
export default function AdminLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
